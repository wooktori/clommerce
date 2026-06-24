import dynamic from "next/dynamic";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded mb-1 w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

const SellerProductList = dynamic(
  () => import("@/components/product/SellerProductList"),
  { loading: () => <GridSkeleton /> }
);

export default function SellerProductsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <SellerProductList />
    </main>
  );
}
