export function formatDate(date: Date): string {
  return date
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
}

export function formatShortDate(date: Date): string {
  return date
    .toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
    .replace(/\. $/, "")
    .replace(". ", ".");
}
