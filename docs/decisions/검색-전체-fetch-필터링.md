# 검색 개선 — 로드된 데이터 필터링 → 전체 fetch 후 클라이언트 필터링

## Situation

`ShopPage`의 검색 기능은 `useMemo`로 `allProducts` 배열을 순회하며 필터링하는 방식이었다.

```ts
// 변경 전
const displayed = useMemo(() => {
  let list = allProducts; // 무한 스크롤로 이미 로드된 페이지만
  if (search.trim()) {
    list = list.filter((p) => p.productName.toLowerCase().includes(q));
  }
  return list;
}, [allProducts, search, priceSort]);
```

`allProducts`는 무한 스크롤이 내려받은 페이지를 평탄화한 것이므로,
사용자가 3페이지까지 스크롤한 시점에는 3페이지 분량의 상품만 검색 대상이다.
4페이지 이후 상품은 검색에 걸리지 않는다.

커머스 검색은 전체 상품 중에서 찾는 것이 기본 전제이므로
현재 구조는 기능적으로 올바르지 않다.

## Task

- 검색어 입력 시 무한 스크롤 범위에 관계없이 전체 상품에서 결과를 반환
- 검색어가 없을 때는 기존 무한 스크롤 유지
- 검색이 Firestore 호출을 트리거하므로 debounce 적용

## Action

### 검색 방식 결정 — Firestore prefix 검색 vs 전체 fetch 후 클라이언트 필터링

| 방식 | 장점 | 단점 |
|---|---|---|
| Firestore `>=` / `<=` prefix 검색 | Firestore 직접 쿼리, 결과 즉시 반환 | 시작 문자 일치만 가능 — '셔츠'로 '반팔 셔츠' 못 찾음, 복합 인덱스 생성 필요 |
| 전체 fetch 후 클라이언트 필터링 | 한국어 포함 검색 가능, 인덱스 불필요 | 첫 검색 시 상품 목록 전체를 한 번 가져와야 함 |

Firestore는 문자열 범위 쿼리(`>=`, `<=`)로 prefix 검색만 지원한다.
'반팔 셔츠'를 '셔츠'로 찾으려면 substring 매칭이 필요하므로 Firestore 자체 검색으로는 불가능하다.
전체 fetch 후 클라이언트 필터링 방식을 채택했다.

### 구현

**`src/services/product.ts` — `getAllShopProducts` 추가**

커서 없이 카테고리별 전체 상품(최대 200개)을 반환하는 함수.
페이지네이션 커서(`lastCreatedAt`)가 없으므로 반환 타입이 단순하다.

```ts
export async function getAllShopProducts(
  category: string | null,
  pageLimit = 200
): Promise<Product[]>
```

**`src/hooks/useProducts.ts` — `useAllShopProducts` 추가**

```ts
export function useAllShopProducts(category: string | null, searchQuery: string) {
  return useQuery({
    queryKey: ["products", "search", category],  // query 미포함
    queryFn: () => getAllShopProducts(category),
    enabled: searchQuery.trim().length > 0,
    select: (products) => {
      const q = searchQuery.trim().toLowerCase();
      return products.filter((p) => p.productName.toLowerCase().includes(q));
    },
  });
}
```

queryKey에 `searchQuery`를 포함하지 않는 것이 핵심이다.
같은 카테고리 내에서 검색어만 바뀔 때 Firestore 재호출 없이
React Query의 `select`만 재실행해 메모리에서 필터링한다.
Firestore 호출은 카테고리가 바뀔 때만 발생한다.

**`src/components/product/ShopPage.tsx` — debounce + 이중 모드**

검색어가 있을 때(`isSearchMode`)와 없을 때를 분기한다.

```
검색어 없음 → useShopProducts (무한 스크롤)
검색어 있음 → useAllShopProducts (전체 fetch + select 필터)
```

debounce는 외부 라이브러리 없이 `useEffect` + `setTimeout`으로 구현했다(300ms).
검색어 입력마다 Firestore를 호출하지 않도록 한다.

```ts
useEffect(() => {
  const t = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(t);
}, [search]);
```

무한 스크롤 트리거도 `isSearchMode`일 때 비활성화한다.

```ts
useEffect(() => {
  if (!isSearchMode && inView && hasNextPage && !isFetchingNextPage) fetchNextPage();
}, [isSearchMode, inView, hasNextPage, isFetchingNextPage, fetchNextPage]);
```

## Result

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 검색 범위 | 무한 스크롤로 로드된 페이지만 | 카테고리 전체 상품(최대 200개) |
| 한국어 포함 검색 | 가능 (클라이언트 필터) | 가능 (클라이언트 필터 유지) |
| 검색 시 Firestore 호출 | 없음 | 카테고리당 최초 1회 (캐시 재사용) |
| debounce | 없음 (의미 없었음) | 300ms |
| 무한 스크롤 | 검색 중에도 동작 | 검색 중 비활성화, 검색어 지우면 복귀 |
| UI 변경 | — | 없음 |

### 캐싱 동작

동일 카테고리에서 '셔츠' → '반팔' → '니트'로 검색어를 바꿀 때
Firestore 호출은 처음 한 번만 발생한다.
이후 검색어 변경은 캐시된 상품 배열에 `select`만 재실행한다.

### 한계

- 상품이 200개를 초과하면 검색 누락이 발생한다.
  규모가 커지면 `pageLimit`를 높이거나 Algolia 같은 전문 검색 서비스 도입을 검토한다.
- 대소문자 구분 없는 검색은 영문에 한해 처리된다(`toLowerCase`).
  한국어는 대소문자 개념이 없으므로 영향 없음.
