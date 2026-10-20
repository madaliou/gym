import Link from "next/link";
import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        G
      </span>
      <span className="text-sm font-semibold tracking-[0.18em]">{APP_NAME}</span>
    </Link>
  );
}
