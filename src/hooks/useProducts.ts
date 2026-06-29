import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getAllShopProducts,
  getProductsByCategory,
  getSellerProducts,
  getShopProducts,
  updateProduct,
  ProductFormData,
} from "@/services/product";
import { DocumentSnapshot } from "firebase/firestore";

export function useRelatedProducts(category: string, excludeId: string) {
  return useQuery({
    queryKey: ["products", "related", category, excludeId],
    queryFn: async () => {
      const products = await getProductsByCategory(category, 5);
      return products.filter((p) => p.id !== excludeId).slice(0, 4);
    },
    enabled: !!category,
  });
}

export function useAllShopProducts(category: string | null, searchQuery: string) {
  return useQuery({
    queryKey: ["products", "search", category],
    queryFn: () => getAllShopProducts(category),
    enabled: searchQuery.trim().length > 0,
    select: (products) => {
      const q = searchQuery.trim().toLowerCase();
      return products.filter((p) => p.productName.toLowerCase().includes(q));
    },
    staleTime: 60 * 1000,
  });
}

export function useShopProducts(category: string | null) {
  return useInfiniteQuery({
    queryKey: ["products", "shop", category],
    queryFn: ({ pageParam }) =>
      getShopProducts(category, pageParam as number | undefined),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => lastPage.lastCreatedAt ?? undefined,
  });
}

export function useSellerProducts(sellerId: string) {
  return useInfiniteQuery({
    queryKey: ["products", "seller", sellerId],
    queryFn: ({ pageParam }) =>
      getSellerProducts(sellerId, pageParam as DocumentSnapshot | undefined),
    initialPageParam: undefined as DocumentSnapshot | undefined,
    getNextPageParam: (lastPage) => lastPage.lastDoc ?? undefined,
    enabled: !!sellerId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sellerId,
      data,
      imageFiles,
    }: {
      sellerId: string;
      data: ProductFormData;
      imageFiles: File[];
    }) => createProduct(sellerId, data, imageFiles),
    onSuccess: (_, { sellerId }) => {
      queryClient.invalidateQueries({
        queryKey: ["products", "seller", sellerId],
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      newImageFiles,
      removedImageUrls,
    }: {
      id: string;
      sellerId: string;
      data: Partial<ProductFormData>;
      newImageFiles: File[];
      removedImageUrls: string[];
    }) => updateProduct(id, data, newImageFiles, removedImageUrls),
    onSuccess: (_, { sellerId }) => {
      queryClient.invalidateQueries({
        queryKey: ["products", "seller", sellerId],
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; sellerId: string }) => deleteProduct(id),
    onSuccess: (_, { sellerId }) => {
      queryClient.invalidateQueries({
        queryKey: ["products", "seller", sellerId],
      });
    },
  });
}
