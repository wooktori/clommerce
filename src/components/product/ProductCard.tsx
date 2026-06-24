import Link from "next/link";
import { Product } from "@/types/product";
import ProductImageCarousel from "./ProductImageCarousel";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <ProductImageCarousel images={product.productImage} productId={product.id} />
      <Link href={`/products/${product.id}`} className="block mt-3 space-y-0.5">
        <p className="text-2xs tracking-[0.12em] uppercase text-ink-muted">
          {product.productCategory}
        </p>
        <p className="text-xs font-medium text-ink truncate group-hover:underline underline-offset-2">
          {product.productName}
        </p>
        <p className="text-xs font-bold text-heading tabular-nums">
          {product.productPrice.toLocaleString()}원
        </p>
      </Link>
    </div>
  );
}
