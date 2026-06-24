import { notFound } from "next/navigation";
import { getProduct } from "@/services/product";
import { getUserProfile } from "@/services/user";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const seller = await getUserProfile(product.sellerId);

  return (
    <ProductDetailClient
      product={product}
      sellerName={seller?.nickname ?? ""}
    />
  );
}
