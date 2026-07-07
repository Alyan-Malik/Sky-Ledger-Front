import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  invert = false,
  to = "/",
}: {
  className?: string;
  invert?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:scale-105">
        <Plane className="h-5 w-5 -rotate-45" />
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          invert ? "text-white" : "text-foreground",
        )}
        style={{ fontFamily: "var(--font-display)" }}
      >
        Sky<span className="text-primary">Ledger</span>
      </span>
    </Link>
  );
}