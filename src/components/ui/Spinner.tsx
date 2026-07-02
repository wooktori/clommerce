interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const dimension = size === "sm" ? "w-4 h-4 border-2" : "w-8 h-8 border-[3px]";

  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={`inline-block rounded-full animate-spin border-rule border-t-ink ${dimension} ${className}`}
    />
  );
}
