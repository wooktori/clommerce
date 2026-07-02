import SellerOrderList from "@/components/order/SellerOrderList";

export const metadata = { title: "주문 관리" };

export default function SellerOrdersPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <SellerOrderList />
    </main>
  );
}
