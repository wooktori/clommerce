import NewProductClient from "@/components/product/NewProductClient";

export default function NewProductPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-bold mb-6">상품 등록</h1>
      <NewProductClient />
    </main>
  );
}
