import dynamic from "next/dynamic";

function FormSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-5">
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-24 h-24 bg-gray-200 rounded" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-gray-200 rounded w-16 mb-1" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded" />
    </div>
  );
}

const NewProductClient = dynamic(
  () => import("@/components/product/NewProductClient"),
  { loading: () => <FormSkeleton /> }
);

export default function NewProductPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <NewProductClient />
    </main>
  );
}
