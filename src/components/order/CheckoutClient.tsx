"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/providers/AuthProvider";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { decreaseStock, restoreStock, getProduct } from "@/services/product";
import { requestPay } from "@/lib/iamport";
import { ORDER_STATUS } from "@/types/order";
import FormField from "@/components/ui/FormField";

const checkoutSchema = z.object({
  buyerName: z.string().trim().min(2, "이름을 입력해주세요."),
  buyerPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,11}$/, "올바른 연락처를 입력해주세요. (숫자만, 10~11자리)"),
  deliveryAddress: z.string().trim().min(5, "배송지를 입력해주세요."),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutClient() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const showToast = useToastStore((s) => s.show);
  const { mutateAsync: createOrder } = useCreateOrder();

  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  useEffect(() => {
    if (items.length === 0) router.replace("/");
  }, [items.length, router]);

  async function onSubmit(data: CheckoutFormData) {
    if (!user || !profile) return;

    // 1. 재고 최신값 확인 및 상품 정보 수집
    const productMap: Record<string, { sellerId: string; sellerName: string }> = {};
    for (const item of items) {
      const product = await getProduct(item.productId);
      if (!product || product.productQuantity < item.quantity) {
        setError("root", {
          message: `'${item.name}' 상품의 재고가 부족합니다. 장바구니를 확인해주세요.`,
        });
        return;
      }
      productMap[item.productId] = {
        sellerId: product.sellerId,
        sellerName: "", // 판매자명은 UserProfile에서 별도 조회 필요 — 우선 빈 값
      };
    }

    // 2. 재고 선점 감소
    const decreased: { productId: string; quantity: number }[] = [];
    try {
      for (const item of items) {
        await decreaseStock(item.productId, item.quantity);
        decreased.push({ productId: item.productId, quantity: item.quantity });
      }
    } catch {
      // 일부만 감소된 경우 복구
      for (const d of decreased) await restoreStock(d.productId, d.quantity).catch(() => null);
      setError("root", { message: "재고 처리 중 오류가 발생했습니다. 다시 시도해주세요." });
      return;
    }

    // 3. 포트원 V2 결제
    let paymentSuccess = false;

    try {
      const response = await requestPay({
        paymentId: `payment-${Date.now()}`,
        orderName: items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}건`,
        totalAmount: totalPrice,
        customer: {
          fullName: data.buyerName,
          phoneNumber: data.buyerPhone,
          email: user.email ?? undefined,
        },
        address: data.deliveryAddress,
      });

      if (response?.code) {
        throw new Error(response.message ?? "결제가 취소되었습니다.");
      }

      paymentSuccess = true;

      // 4. 주문 생성
      for (const item of items) {
        const { sellerId, sellerName } = productMap[item.productId];
        await createOrder({
          buyerId: user.uid,
          sellerId,
          sellerName,
          productId: item.productId,
          productName: item.name,
          productImage: item.image,
          productPrice: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
          status: ORDER_STATUS.ORDER_COMPLETE,
          buyerName: data.buyerName,
          buyerPhone: data.buyerPhone,
          deliveryAddress: data.deliveryAddress,
        });
      }

      clearCart();
      showToast("결제가 완료되었습니다.", "success");
      router.push("/buyer/orders");
    } catch (err) {
      if (!paymentSuccess) {
        // 결제 취소/실패 시 재고 복구
        for (const d of decreased) await restoreStock(d.productId, d.quantity).catch(() => null);
        setError("root", {
          message: err instanceof Error ? err.message : "결제에 실패했습니다.",
        });
      } else {
        // 결제는 됐으나 주문 생성 실패 (드문 경우)
        showToast("결제는 완료됐으나 주문 기록에 실패했습니다. 고객센터에 문의해주세요.", "error");
      }
    }
  }

  if (items.length === 0) return null;

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-xl font-bold text-heading mb-8">결제</h1>

        {/* 주문 상품 요약 */}
        <section className="border border-rule mb-8">
          <div className="px-6 py-4 border-b border-rule">
            <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-ink-muted">
              주문 상품
            </h2>
          </div>
          <ul className="divide-y divide-rule">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center justify-between px-6 py-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{item.name}</p>
                  <p className="text-2xs text-ink-muted mt-0.5">수량 {item.quantity}</p>
                </div>
                <p className="text-xs font-bold text-heading ml-4 shrink-0">
                  ₩ {(item.price * item.quantity).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between px-6 py-4 border-t border-rule bg-fill">
            <span className="text-2xs tracking-[0.12em] uppercase text-ink-muted">합계</span>
            <span className="text-base font-bold text-heading">
              ₩ {totalPrice.toLocaleString()}
            </span>
          </div>
        </section>

        {/* 배송 정보 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          <section className="border border-rule">
            <div className="px-6 py-4 border-b border-rule">
              <h2 className="text-xs font-semibold tracking-[0.12em] uppercase text-ink-muted">
                배송 정보
              </h2>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <FormField label="수령인" error={errors.buyerName?.message}>
                <input
                  type="text"
                  {...register("buyerName")}
                  placeholder="홍길동"
                  className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                />
              </FormField>

              <FormField label="연락처" error={errors.buyerPhone?.message}>
                <input
                  type="tel"
                  {...register("buyerPhone")}
                  placeholder="01012345678"
                  className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                />
              </FormField>

              <FormField label="배송지" error={errors.deliveryAddress?.message}>
                <input
                  type="text"
                  {...register("deliveryAddress")}
                  placeholder="서울시 강남구 테헤란로 123"
                  className="border border-rule rounded-xs px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors"
                />
              </FormField>
            </div>
          </section>

          {errors.root && (
            <p className="text-2xs text-danger border-l-2 border-danger pl-3 py-1">
              {errors.root.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 bg-brand text-white text-xs font-semibold tracking-[0.15em] uppercase hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {isSubmitting ? "처리 중..." : `₩ ${totalPrice.toLocaleString()} 결제하기`}
          </button>
        </form>
      </main>
    </>
  );
}
