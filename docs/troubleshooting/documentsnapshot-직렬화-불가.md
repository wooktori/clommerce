# DocumentSnapshot 직렬화 불가 — HydrationBoundary 적용 실패

## Situation

메인 페이지 렌더링 전략을 CSR에서 SSR로 전환하기 위해
React Query의 `prefetchInfiniteQuery` + `HydrationBoundary` 패턴을 도입했다.

`HydrationBoundary`는 서버에서 채운 QueryClient 캐시를 `dehydrate(queryClient)`로
직렬화한 뒤 HTML에 심어 클라이언트로 전달한다.
클라이언트는 이를 역직렬화해 캐시를 복원하므로, 클라이언트 컴포넌트가
마운트 즉시 Firestore 요청 없이 데이터를 읽을 수 있다.

그런데 기존 `getShopProducts`의 반환 타입은 다음과 같았다.

```ts
{ products: Product[]; lastDoc: DocumentSnapshot | null }
```

`lastDoc`(Firestore `DocumentSnapshot`)이 React Query 캐시 안에 들어가
`dehydrate`가 이를 JSON으로 직렬화하려 시도한다.

## Task

`DocumentSnapshot`이 직렬화 불가인 이유를 파악하고,
HydrationBoundary를 깨지 않으면서 커서 기반 무한 스크롤을 유지하는 방법을 찾는다.

## Action

### DocumentSnapshot이 직렬화 불가인 이유

`DocumentSnapshot`은 단순한 데이터 객체가 아니다.
Firestore SDK가 관리하는 **살아있는 객체**로, 다음을 포함한다.

- 내부 Firestore 엔진 상태 (`_document`, `_converter`, ...)
- 인덱스 커서 위치 정보 (orderBy 기준의 필드 값 + 문서 위치)
- 메서드 (`data()`, `get()`, `exists()`, ...)
- `DocumentReference` — DB 내 위치 포인터

`JSON.stringify(documentSnapshot)` 결과는 `"{}"` 다.
메서드·내부 참조·엔진 상태가 전부 소실되고 빈 객체만 남는다.

`startAfter(snapshot)` 가 동작하는 이유는 snapshot 안에
Firestore가 커서를 계산하는 데 필요한 모든 정보가 살아있기 때문이다.
역직렬화한 `{}` 를 넘기면 Firestore가 커서를 읽지 못해 페이지네이션이 깨진다.

### 해결 방향 검토

| 방법 | 문제점 |
|---|---|
| `DocumentSnapshot`을 그대로 유지 | `dehydrate` 시 소실 → 페이지네이션 깨짐 |
| 문서 ID를 커서로 사용 | `startAfter(docRef)` 는 snapshot 없이 동작 안 함 — 별도 조회 필요 |
| `createdAt` Timestamp를 숫자로 변환 | 직렬화 가능, `Timestamp.fromMillis()`로 재구성 가능 |

`createdAt` 은 `orderBy("createdAt", "desc")` 기준 필드이므로
`startAfter(Timestamp.fromMillis(millis))` 로 정확한 커서 위치를 재현할 수 있다.

### 적용한 변경

**`src/services/product.ts`**

```ts
// 변경 전
export async function getShopProducts(
  category: string | null,
  lastDoc?: DocumentSnapshot,
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  if (lastDoc) constraints.push(startAfter(lastDoc));
  return { products, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

// 변경 후
export async function getShopProducts(
  category: string | null,
  lastCreatedAt?: number,          // Timestamp millis — JSON 직렬화 가능
): Promise<{ products: Product[]; lastCreatedAt: number | null }> {
  if (lastCreatedAt !== undefined) {
    constraints.push(startAfter(Timestamp.fromMillis(lastCreatedAt)));
  }
  const lastSnap = snap.docs[snap.docs.length - 1];
  const cursor = lastSnap?.data().createdAt?.toMillis?.() ?? null;
  return { products, lastCreatedAt: cursor };
}
```

**`src/hooks/useProducts.ts`**

```ts
// 변경 전
initialPageParam: undefined as DocumentSnapshot | undefined,
getNextPageParam: (lastPage) => lastPage.lastDoc ?? undefined,

// 변경 후
initialPageParam: undefined as number | undefined,
getNextPageParam: (lastPage) => lastPage.lastCreatedAt ?? undefined,
```

+) `getSellerProducts`도 `DocumentSnapshot` 커서를 사용하지만
판매자 상품 관리 페이지는 CSR 전용이므로 `HydrationBoundary`를 거치지 않는다.
직렬화 문제가 발생하지 않아 변경하지 않았다.

## Result

- `lastCreatedAt: number`는 `JSON.stringify` 로 완벽하게 직렬화된다.
- `dehydrate(queryClient)`가 첫 페이지 데이터를 HTML에 정상 포함한다.
- 클라이언트 hydrate 후 `MainHero`·`ShopPage` 모두 Firestore 재요청 없이
  캐시에서 즉시 첫 페이지를 읽는다.
- 무한 스크롤은 `Timestamp.fromMillis(lastCreatedAt)` 으로 커서를 재구성해
  2페이지 이후도 정상 동작한다.

### 주의: 동일 타임스탬프 중복 문제

`createdAt`을 단일 커서로 쓰는 구조이므로,
두 상품의 `serverTimestamp()` 값이 완전히 동일하면 해당 경계에서
상품이 중복 노출되거나 누락될 수 있다.
Firestore `serverTimestamp()`는 마이크로초 단위 정밀도라 실제 충돌 가능성은 낮으나
완전히 배제할 수 없다. 정확한 커서가 필요하다면 `orderBy(documentId())`를
보조 정렬 키로 추가하고 `[createdAt_millis, docId]` 복합 커서를 사용한다.
