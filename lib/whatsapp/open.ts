"use client";

export function openWhatsAppHref(href: string) {
  const popup = window.open(href, "_blank", "noopener,noreferrer");
  return popup !== null;
}
