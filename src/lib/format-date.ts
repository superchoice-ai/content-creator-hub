const formatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "short",
  day: "numeric",
});

export function formatPostDate(iso: string) {
  return formatter.format(new Date(iso));
}
