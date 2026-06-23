import Link from "next/link";
import { Product } from "@/types/product";
import ProductImageCarousel from "./ProductImageCarousel";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group">
      <ProductImageCarousel images={product.productImage} productId={product.id} />
      <Link href={`/products/${product.id}`} className="block mt-2 space-y-0.5">
        <p className="text-xs text-gray-400">{product.productCategory}</p>
        <p className="text-sm font-medium text-gray-900 truncate group-hover:underline">
          {product.productName}
        </p>
        <p className="text-sm font-semibold">
          {product.productPrice.toLocaleString()}원
        </p>
      </Link>
    </div>
  );
}
