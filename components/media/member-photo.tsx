"use client";

import Image from "next/image";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const thumbnailSize = {
  sm: "size-9 rounded-full",
  md: "size-11 rounded-full",
  lg: "size-16 rounded-xl",
} as const;

const thumbnailPixels = {
  sm: 36,
  md: 44,
  lg: 64,
} as const;

type MemberPhotoProps = {
  src: string | null;
  name: string;
  size?: keyof typeof thumbnailSize;
  className?: string;
};

export function MemberPhoto({ src, name, size = "sm", className }: MemberPhotoProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex shrink-0 items-center justify-center bg-muted text-xs text-muted-foreground",
          thumbnailSize[size],
          className,
        )}
      >
        {initials}
      </span>
    );
  }

  const pixels = thumbnailPixels[size];

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        className={cn(
          "group relative shrink-0 overflow-hidden ring-1 ring-foreground/10 outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          thumbnailSize[size],
          className,
        )}
        type="button"
        aria-label={name === "Aperçu de la photo" ? "Agrandir l'aperçu" : `Agrandir la photo de ${name}`}
      >
        <Image
          src={src}
          alt=""
          width={pixels}
          height={pixels}
          unoptimized
          className="size-full object-cover"
        />
        <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[90] bg-black/70 duration-100 supports-backdrop-filter:backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-[91] w-[min(100%-1.5rem,32rem)] -translate-x-1/2 -translate-y-1/2 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <DialogPrimitive.Title className="sr-only">{`Photo de ${name}`}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Photo agrandie pour reconnaître le membre.
          </DialogPrimitive.Description>
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/15">
            <Image
              src={src}
              alt={`Photo de ${name}`}
              width={640}
              height={640}
              unoptimized
              className="aspect-square max-h-[min(80vh,32rem)] w-full object-cover"
            />
            <p className="px-4 py-3 text-center text-sm font-medium">{name}</p>
          </div>
          <DialogPrimitive.Close
            render={<Button variant="ghost" size="icon-sm" className="absolute -top-2 -right-2 bg-card ring-1 ring-foreground/10" />}
          >
            <XIcon />
            <span className="sr-only">Fermer</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
