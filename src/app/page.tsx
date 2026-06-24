import MainHero from "@/components/product/MainHero";
import ShopPage from "@/components/product/ShopPage";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  return (
    <>
      <MainHero />
      <ShopPage category={category ?? null} />
    </>
  );
}
