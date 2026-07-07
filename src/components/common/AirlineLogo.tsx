import { airlines } from "@/data/mock";
import { cn } from "@/lib/utils";

export function AirlineLogo({
  code,
  size = "md",
  className,
}: {
  code: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const airline = airlines.find((a) => a.code === code);
  const dims =
    size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-14 w-14 text-lg" : "h-11 w-11 text-sm";
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-xl font-bold text-white shadow-soft",
        dims,
        className,
      )}
      style={{ backgroundColor: airline?.color ?? "#2e77be" }}
      aria-hidden
    >
      {code}
    </div>
  );
}