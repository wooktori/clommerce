import Link from "next/link";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface CategorySectionProps {
  category: string;
  products: Product[];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-bold tracking-widest uppercase">{category}</h2>
        <Link
          href={`/products?category=${encodeURIComponent(category)}`}
          className="text-2xs text-ink-muted hover:text-ink tracking-wide transition-colors"
        >
          더보기 →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
