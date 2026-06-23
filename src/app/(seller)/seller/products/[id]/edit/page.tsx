import EditProductClient from "@/components/product/EditProductClient";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold mb-6">상품 수정</h1>
      <EditProductClient productId={id} />
    </main>
  );
}
