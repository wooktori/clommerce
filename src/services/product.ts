import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Product } from "@/types/product";

type FirestoreProductData = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  createdAt?: { toDate?: () => Date };
  updatedAt?: { toDate?: () => Date };
};

function toProduct(id: string, data: FirestoreProductData): Product {
  return {
    id,
    sellerId: data.sellerId,
    productName: data.productName,
    productPrice: data.productPrice,
    productQuantity: data.productQuantity,
    productDescription: data.productDescription,
    productCategory: data.productCategory,
    productImage: data.productImage,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<string[]> {
  const uploads = files.map(async (file) => {
    const storageRef = ref(storage, `products/${productId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });
  return Promise.all(uploads);
}

export async function deleteProductImages(urls: string[]): Promise<void> {
  await Promise.all(
    urls.map((url) => deleteObject(ref(storage, url)).catch(() => null))
  );
}

export type ProductFormData = {
  productName: string;
  productPrice: number;
  productQuantity: number;
  productDescription: string;
  productCategory: string;
};

export async function createProduct(
  sellerId: string,
  data: ProductFormData,
  imageFiles: File[]
): Promise<string> {
  const docRef = await addDoc(collection(db, "products"), {
    sellerId,
    ...data,
    productImage: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const imageUrls = await uploadProductImages(docRef.id, imageFiles);

  await updateDoc(docRef, { productImage: imageUrls });

  return docRef.id;
}

export async function getSellerProducts(
  sellerId: string,
  lastDoc?: DocumentSnapshot,
  pageLimit = 10
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [
    where("sellerId", "==", sellerId),
    orderBy("createdAt", "desc"),
    limit(pageLimit),
  ];

  if (lastDoc) constraints.push(startAfter(lastDoc));

  const snap = await getDocs(query(collection(db, "products"), ...constraints));
  const products = snap.docs.map((d) =>
    toProduct(d.id, d.data() as FirestoreProductData)
  );

  return {
    products,
    lastDoc: snap.docs[snap.docs.length - 1] ?? null,
  };
}

export async function getProductsByCategory(
  category: string,
  pageLimit = 4
): Promise<Product[]> {
  const snap = await getDocs(
    query(
      collection(db, "products"),
      where("productCategory", "==", category),
      orderBy("createdAt", "desc"),
      limit(pageLimit)
    )
  );
  return snap.docs.map((d) => toProduct(d.id, d.data() as FirestoreProductData));
}

export async function getShopProducts(
  category: string | null,
  lastDoc?: DocumentSnapshot,
  pageLimit = 12
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [];

  if (category) {
    constraints.push(where("productCategory", "==", category));
  }

  constraints.push(orderBy("createdAt", "desc"), limit(pageLimit));

  if (lastDoc) constraints.push(startAfter(lastDoc));

  const snap = await getDocs(query(collection(db, "products"), ...constraints));
  const products = snap.docs.map((d) =>
    toProduct(d.id, d.data() as FirestoreProductData)
  );

  return { products, lastDoc: snap.docs[snap.docs.length - 1] ?? null };
}

export async function getProduct(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data() as FirestoreProductData);
}

export async function updateProduct(
  id: string,
  data: Partial<ProductFormData>,
  newImageFiles: File[],
  removedImageUrls: string[]
): Promise<void> {
  if (removedImageUrls.length > 0) {
    await deleteProductImages(removedImageUrls);
  }

  const newUrls =
    newImageFiles.length > 0
      ? await uploadProductImages(id, newImageFiles)
      : [];

  await updateDoc(doc(db, "products", id), {
    ...data,
    ...(newUrls.length > 0 ? { productImage: newUrls } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const product = await getProduct(id);
  if (product?.productImage.length) {
    await deleteProductImages(product.productImage);
  }
  await deleteDoc(doc(db, "products", id));
}
