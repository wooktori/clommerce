import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order, OrderStatus } from "@/types/order";

type FirestoreOrderData = Omit<Order, "id" | "createdAt" | "updatedAt"> & {
  createdAt?: { toDate?: () => Date };
  updatedAt?: { toDate?: () => Date };
};

function toOrder(id: string, data: FirestoreOrderData): Order {
  return {
    id,
    buyerId: data.buyerId,
    productId: data.productId,
    productName: data.productName,
    productImage: data.productImage,
    productPrice: data.productPrice,
    quantity: data.quantity,
    totalPrice: data.totalPrice,
    status: data.status,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function getBuyerOrders(buyerId: string): Promise<Order[]> {
  const snap = await getDocs(
    query(
      collection(db, "orders"),
      where("buyerId", "==", buyerId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => toOrder(d.id, d.data() as FirestoreOrderData));
}

export async function cancelOrder(orderId: string): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), {
    status: "cancelled" as OrderStatus,
    updatedAt: serverTimestamp(),
  });
}
