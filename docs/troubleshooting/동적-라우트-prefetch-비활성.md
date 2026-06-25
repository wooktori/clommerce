# 동적 라우트 prefetch 기본 비활성 — 상품 카드 hover prefetch

## Situation

상품 목록에서 카드를 클릭해 상품 상세 페이지로 이동할 때마다
브라우저 로딩 인디케이터가 돌고 페이지 전환이 느렸다.

`<Link href="/products/[id]">`를 사용하고 있었고,
Next.js의 `Link` 컴포넌트는 뷰포트에 진입하면 자동으로 prefetch한다고 알고 있었다.
그런데 왜 느린지 이유를 알 수 없었다.

## Task

- 상품 카드 클릭 시 페이지 전환이 즉각적으로 느껴져야 했다
- `Link`의 prefetch가 동작하지 않는 이유를 파악해야 했다

## Action

### 1단계 — Next.js 16 prefetching 문서 확인

`node_modules/next/dist/docs/01-app/02-guides/prefetching.md`를 읽었다.

정적 페이지와 동적 페이지의 prefetch 동작이 다르다는 것을 발견했다:

| | 정적 페이지 | 동적 페이지 |
|---|---|---|
| **Prefetch 여부** | 뷰포트 진입 시 자동 | **기본 비활성** |
| **Client Cache TTL** | 5분 | 비활성 (별도 설정 필요) |
| **클릭 시 서버 왕복** | 없음 | **있음** |

> "Dynamic page: No, unless `loading.js`"

`/products/[id]` 페이지는 Next.js App Router RSC로 구현되어 있고
매 요청마다 Firestore에서 데이터를 서버에서 가져온다.
이는 **동적 페이지**이므로 `Link`의 뷰포트 기반 자동 prefetch가 동작하지 않는다.

즉, 그동안 prefetch가 된다고 생각했지만 실제로는 아무것도 prefetch되지 않고 있었다.

### 2단계 — 해결 방향 검토

문서에서 두 가지 패턴을 제시했다.

**패턴 A: Manual prefetch (`router.prefetch()`)**

```tsx
'use client'

import { useRouter } from 'next/navigation'

export function PricingCard() {
  const router = useRouter()

  return (
    <div onMouseEnter={() => router.prefetch('/pricing')}>
      {/* ... */}
    </div>
  )
}
```

**패턴 B: HoverPrefetchLink (`prefetch={null}` 전환)**

```tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export function HoverPrefetchLink({ href, children }) {
  const [active, setActive] = useState(false)

  return (
    <Link
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
    >
      {children}
    </Link>
  )
}
```

`prefetch={false}`: 기본적으로 prefetch 안 함 (뷰포트 진입 시에도)
`prefetch={null}`: 기본 정적 prefetch 동작 복원 (호버 후 즉시 prefetch 시작)

### 3단계 — ProductCard에 패턴 A 적용

`ProductCard`에는 이미지(carousel)와 텍스트 두 영역에 각각 Link가 있다.
패턴 B는 Link 하나에만 적용되므로 이미지 호버 시 prefetch가 누락된다.

카드 전체를 감싸는 div에 `onMouseEnter`를 달아
어느 영역에서 호버하든 prefetch가 발동하도록 했다.

```tsx
"use client";

import { useRouter } from "next/navigation";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();

  return (
    <div
      className="group"
      onMouseEnter={() => router.prefetch(`/products/${product.id}`)}
    >
      <ProductImageCarousel ... />
      <Link href={`/products/${product.id}`}>...</Link>
    </div>
  );
}
```

`ProductCard`에 `"use client"` 추가가 필요했지만
이미 `ProductImageCarousel`이 client component이므로
트리 단위 RSC 경계에 실질적인 변화는 없었다.

## Result

**hover 시 route prefetch가 트리거되어 클릭 시 즉각적인 페이지 전환이 가능해졌다.**

동적 페이지이므로 서버 왕복 자체를 없애지는 못하지만,
prefetch 덕분에 클릭 전에 서버에서 RSC payload 생성이 시작되어
사용자 체감 지연이 크게 줄어든다.

**교훈**: Next.js `Link`의 자동 prefetch는 정적 페이지에만 동작한다.
Firestore·DB 조회가 있는 동적 페이지는 prefetch가 기본 비활성이며,
별도로 명시적 prefetch 전략을 적용해야 빠른 네비게이션을 구현할 수 있다.
공식 문서에 동작 방식이 표로 명확하게 정리되어 있으므로
"왜 안 되지?"에서 시작하는 디버깅보다 문서 확인이 훨씬 빠른 해결책이었다.
