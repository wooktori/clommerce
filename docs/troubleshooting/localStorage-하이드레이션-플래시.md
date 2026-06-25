# localStorage 하이드레이션 플래시 — 장바구니 뱃지 0→N 깜박임

## Situation

헤더의 장바구니 뱃지가 새로고침 직후 0으로 잠깐 보였다가
localStorage에 저장된 실제 수량(예: 3)으로 바뀌는 현상이 발생했다.

사용자 입장에서는 뱃지가 없다가 생기는 것처럼 보인다.
장바구니에 상품이 담겨 있다는 걸 이미 알고 있는 사용자에게 혼란을 준다.

## Task

- 새로고침 후 뱃지가 즉시 정확한 수량을 보여주어야 했다
- localStorage 데이터를 최초 렌더에서 읽어야 했다
- 서버 사이드 렌더링(SSR) 환경에서 `window` 객체에 접근하면 에러가 발생하므로
  SSR과 CSR 양쪽을 모두 고려해야 했다

## Action

### 1단계 — 문제의 원인 파악: useEffect 로딩 타이밍

최초 구현은 React Context + `useEffect`로 localStorage를 읽는 방식이었다.

```tsx
const [items, setItems] = useState<CartItem[]>([]);
const [hydrated, setHydrated] = useState(false);

useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) setItems(JSON.parse(stored));
  setHydrated(true);
}, []);
```

렌더링 순서:
1. 서버: `items = []` → HTML에 뱃지 없음(또는 0)
2. 클라이언트 수신 → 브라우저가 HTML을 먼저 그림 → **뱃지 0 노출**
3. React hydration 완료
4. `useEffect` 실행 → localStorage 읽기 → `setItems` → 리렌더 → **뱃지 N으로 갱신**

2→4 사이의 시간 차이가 flash다.
Next.js 16 공식 문서(`preventing-flash-before-hydration.md`)에도 이 문제가 명시되어 있다:

> "Deferring to `useEffect` avoids the error but **introduces a visible flash**."

### 2단계 — lazy useState initializer 시도

문서가 권장하는 패턴:

```tsx
const [items, setItems] = useState<CartItem[]>(() => {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
});
```

서버: `typeof window === 'undefined'` → `[]` 반환
클라이언트 첫 렌더: `window` 존재 → localStorage 즉시 읽기 → flash 없음

그러나 서버 출력(빈 배열)과 클라이언트 초기값(localStorage의 데이터)이 달라
hydration mismatch가 발생한다. 이를 막으려면 뱃지 요소에
`suppressHydrationWarning`을 추가하고, 인라인 `<script>`로
서버가 렌더한 DOM을 클라이언트 hydration 전에 수정해야 한다.
코드가 복잡해지고 유지보수 부담이 늘어난다.

### 3단계 — 근본 원인이 기술 선택에 있음을 인식

프로젝트 내부 결정 문서(`docs/decisions/전역-상태-관리.md`)를 확인했다.

> **"이 상태가 바뀔 때 Provider 하위 전체가 리렌더링돼도 괜찮은가?"**
>
> | 상태 | 방식 | 이유 |
> |---|---|---|
> | 장바구니 | Zustand | 여러 컴포넌트가 독립적으로 읽고 쓰고, 변경 잦음 |

장바구니를 React Context로 구현한 것 자체가 이미 결정에 어긋났다.
flash 문제는 증상이고, 잘못된 도구 선택이 근본 원인이었다.

### 4단계 — Zustand + persist 미들웨어로 교체

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      // ...actions
    }),
    {
      name: 'clommerce_cart',
      partialize: (state) => ({ items: state.items }), // isOpen 제외
    }
  )
);
```

`persist` 미들웨어가 localStorage 읽기·쓰기·동기화를 내부적으로 처리한다.
컴포넌트는 그냥 `useCartStore(s => s.items)`로 구독만 하면 된다.

추가로 `partialize`로 `isOpen`(드로어 열림 상태)을 localStorage에서 제외했다.
새로고침 시 드로어는 항상 닫혀 있어야 하기 때문이다.

## Result

**Zustand persist로 교체한 뒤 flash가 사라졌다.**

| 방식 | flash | 코드 복잡도 | Context 리렌더 범위 |
|---|---|---|---|
| Context + useEffect | 있음 | 낮음 | Provider 하위 전체 |
| Context + lazy initializer | 없음 | 높음 (suppressHydrationWarning, inline script) | Provider 하위 전체 |
| Zustand + persist | 없음 | 낮음 | 구독 컴포넌트만 |

**교훈**: 복잡한 workaround가 필요해지는 순간, 그 workaround가 정말 필요한 것인지
아니면 도구 선택을 재검토해야 하는 신호인지 먼저 물어야 한다.
이 경우 flash를 없애려는 시도 자체가 맞는 도구를 찾는 계기가 됐다.
