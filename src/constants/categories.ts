export const PRODUCT_CATEGORIES = ["의류", "리빙", "가전"] as const;
export const SHOP_CATEGORIES = ["전체", ...PRODUCT_CATEGORIES] as const;
