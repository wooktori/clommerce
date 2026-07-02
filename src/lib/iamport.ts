import PortOne from "@portone/browser-sdk/v2";

export interface PortOneRequestParams {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  customer: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  address: string;
}

export async function requestPay(params: PortOneRequestParams) {
  const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID ?? "";
  const channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY ?? "";

  const response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId: params.paymentId,
    orderName: params.orderName,
    totalAmount: params.totalAmount,
    currency: "CURRENCY_KRW",
    payMethod: "CARD",
    customer: {
      fullName: params.customer.fullName,
      phoneNumber: params.customer.phoneNumber,
      email: params.customer.email,
    },
  });

  return response;
}
