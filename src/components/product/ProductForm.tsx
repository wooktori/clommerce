"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product } from "@/types/product";
import { ProductFormData } from "@/services/product";

const CATEGORIES = ["상의", "하의", "아우터", "신발", "악세서리"];

const productSchema = z.object({
  productName: z.string().min(1, "상품명을 입력해주세요."),
  productPrice: z.number().min(0, "가격을 0 이상으로 입력해주세요."),
  productQuantity: z.number().min(1, "수량을 1 이상으로 입력해주세요."),
  productDescription: z.string().min(1, "상품 설명을 입력해주세요."),
  productCategory: z.string(),
});

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (
    data: ProductFormData,
    newImageFiles: File[],
    removedImageUrls: string[]
  ) => Promise<void>;
  loading: boolean;
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: initialData?.productName ?? "",
      productPrice: initialData?.productPrice ?? 0,
      productQuantity: initialData?.productQuantity ?? 1,
      productDescription: initialData?.productDescription ?? "",
      productCategory: initialData?.productCategory ?? CATEGORIES[0],
    },
  });

  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.productImage ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
  const hasImages = existingImages.length + newFiles.length > 0;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...files]);
    setImageError("");
    e.target.value = "";
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setRemovedUrls((prev) => [...prev, url]);
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const onFormSubmit = handleSubmit(async (data) => {
    if (!hasImages) {
      setImageError("이미지를 한 장 이상 첨부해주세요.");
      return;
    }
    await onSubmit(data, newFiles, removedUrls);
  });

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-5">
      {/* 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상품 이미지 <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-3 mb-3">
          {existingImages.map((url) => (
            <div key={url} className="relative w-24 h-24">
              <Image
                src={url}
                alt="상품 이미지"
                fill
                className="object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeExistingImage(url)}
                className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
          {newPreviews.map((src, i) => (
            <div key={i} className="relative w-24 h-24">
              <Image
                src={src}
                alt="새 이미지"
                fill
                className="object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeNewFile(i)}
                className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:border-gray-500 transition-colors"
          >
            + 추가
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        {imageError && <p className="text-sm text-red-500">{imageError}</p>}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          카테고리
        </label>
        <select
          {...register("productCategory")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 상품명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상품명
        </label>
        <input
          {...register("productName")}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
        {errors.productName && (
          <p className="text-sm text-red-500 mt-1">{errors.productName.message}</p>
        )}
      </div>

      {/* 가격 / 수량 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            가격 (원)
          </label>
          <input
            type="number"
            min={0}
            {...register("productPrice", { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          {errors.productPrice && (
            <p className="text-sm text-red-500 mt-1">{errors.productPrice.message}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            수량
          </label>
          <input
            type="number"
            min={1}
            {...register("productQuantity", { valueAsNumber: true })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
          {errors.productQuantity && (
            <p className="text-sm text-red-500 mt-1">{errors.productQuantity.message}</p>
          )}
        </div>
      </div>

      {/* 상품 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          상품 설명
        </label>
        <textarea
          {...register("productDescription")}
          rows={5}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
        />
        {errors.productDescription && (
          <p className="text-sm text-red-500 mt-1">{errors.productDescription.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white rounded py-3 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {loading ? "저장 중..." : initialData ? "수정하기" : "등록하기"}
      </button>
    </form>
  );
}
