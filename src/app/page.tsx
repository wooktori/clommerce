import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/getQueryClient";
import { getShopProducts } from "@/services/product";
import MainHero from "@/components/product/MainHero";
import ShopPage from "@/components/product/ShopPage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["products", "shop", null],
    queryFn: ({ pageParam }) =>
      getShopProducts(null, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage: { products: unknown[]; lastCreatedAt: number | null }) =>
      lastPage.lastCreatedAt ?? undefined,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MainHero />
      <ShopPage category={category ?? null} />
    </HydrationBoundary>
  );
}
