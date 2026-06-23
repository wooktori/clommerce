import { getProductsByCategory } from "@/services/product";
import CategorySection from "@/components/product/CategorySection";

const CATEGORIES = ["상의", "하의", "아우터", "신발", "악세서리"];

export default async function Home() {
  const results = await Promise.allSettled(
    CATEGORIES.map((cat) => getProductsByCategory(cat, 4))
  );

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-12">
      {CATEGORIES.map((category, i) => {
        const result = results[i];
        const products = result.status === "fulfilled" ? result.value : [];
        return (
          <CategorySection key={category} category={category} products={products} />
        );
      })}
    </main>
  );
}
