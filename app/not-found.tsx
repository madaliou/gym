import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-sm tracking-wide text-muted-foreground">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Cette adresse ne correspond à aucune page GYMORA.
      </p>
      <Link
        href="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-8 h-11 px-5")}
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
