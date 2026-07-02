"use client";

import { useState, useRef, ChangeEvent, ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product } from "@/types/product";
import { ProductFormData } from "@/services/product";
import { PRODUCT_CATEGORIES } from "@/constants/categories";

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
  title: string;
  submitLabel: string;
  headerExtra?: ReactNode;
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
  title,
  submitLabel,
  headerExtra,
}: ProductFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: initialData?.productName ?? "",
      productPrice: initialData?.productPrice ?? 0,
      productQuantity: initialData?.productQuantity ?? 1,
      productDescription: initialData?.productDescription ?? "",
      productCategory: initialData?.productCategory ?? PRODUCT_CATEGORIES[0],
    },
  });

  const selectedCategory = watch("productCategory");

  const [existingImages, setExistingImages] = useState<string[]>(
    initialData?.productImage ?? []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
  const totalImages = existingImages.length + newFiles.length;
  const hasImages = totalImages > 0;

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

  const inputClass =
    "w-full border border-rule rounded-lg px-4 py-3 text-sm text-ink focus:outline-none focus:border-brand placeholder:text-ink-subtle transition-colors";
  const labelClass = "block text-sm font-medium text-heading mb-2";

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-heading">{title}</h1>
        {headerExtra}
      </div>

      {/* 이미지 */}
      <div>
        <p className={labelClass}>
          상품 이미지{" "}
          <span className="text-ink-muted font-normal">* 필수 · 여러 장</span>
        </p>
        <div className="flex flex-wrap gap-3 mb-2">
          {existingImages.map((url, i) => (
            <div key={url} className="relative w-24 h-24 bg-fill">
              <Image src={url} alt="상품 이미지" fill className="object-cover" />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-2xs font-medium px-1.5 py-0.5 rounded">
                  대표
                </span>
              )}
              <button
                type="button"
                onClick={() => removeExistingImage(url)}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-ink-muted text-xs leading-none hover:bg-white shadow-sm"
              >
                ×
              </button>
            </div>
          ))}
          {newPreviews.map((src, i) => {
            const globalIdx = existingImages.length + i;
            return (
              <div key={i} className="relative w-24 h-24 bg-fill">
                <Image src={src} alt="새 이미지" fill className="object-cover" />
                {globalIdx === 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-2xs font-medium px-1.5 py-0.5 rounded">
                    대표
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-ink-muted text-xs leading-none hover:bg-white shadow-sm"
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-rule rounded flex flex-col items-center justify-center text-ink-muted hover:border-brand hover:text-brand transition-colors gap-1"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-2xs">추가</span>
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
        {imageError ? (
          <p className="text-xs text-danger">{imageError}</p>
        ) : (
          <p className="text-xs text-blue-500">
            JPG·PNG · 첫 번째 이미지가 대표 이미지로 사용됩니다
          </p>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <p className={labelClass}>카테고리</p>
        <div className="flex gap-2">
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setValue("productCategory", cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedCategory === cat
                  ? "bg-heading text-white border-heading"
                  : "border-rule text-ink hover:bg-fill"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input type="hidden" {...register("productCategory")} />
      </div>

      {/* 상품명 */}
      <div>
        <label className={labelClass}>상품명</label>
        <input
          {...register("productName")}
          placeholder="상품 이름을 입력하세요"
          className={inputClass}
        />
        {errors.productName && (
          <p className="text-xs text-danger mt-1">{errors.productName.message}</p>
        )}
      </div>

      {/* 가격 + 수량 */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass}>가격</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-muted pointer-events-none">
              ₩
            </span>
            <input
              type="number"
              min={0}
              {...register("productPrice", { valueAsNumber: true })}
              placeholder="0"
              className={`${inputClass} pl-8`}
            />
          </div>
          {errors.productPrice && (
            <p className="text-xs text-danger mt-1">{errors.productPrice.message}</p>
          )}
        </div>
        <div className="w-32">
          <label className={labelClass}>재고 수량</label>
          <input
            type="number"
            min={1}
            {...register("productQuantity", { valueAsNumber: true })}
            className={inputClass}
          />
          {errors.productQuantity && (
            <p className="text-xs text-danger mt-1">{errors.productQuantity.message}</p>
          )}
        </div>
      </div>

      {/* 상품 설명 */}
      <div>
        <label className={labelClass}>
          상품 상세{" "}
          <span className="text-ink-muted font-normal">* 필수</span>
        </label>
        <textarea
          {...register("productDescription")}
          rows={5}
          placeholder="상품 설명을 입력하세요"
          className={`${inputClass} resize-none`}
        />
        {errors.productDescription && (
          <p className="text-xs text-danger mt-1">{errors.productDescription.message}</p>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.push("/seller/products")}
          className="w-28 h-12 border border-rule rounded-lg text-sm font-medium text-ink hover:bg-fill transition-colors shrink-0"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 bg-heading text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
