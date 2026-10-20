"use client";

import { Copy, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type BirthdayActionsProps = {
  message: string;
  whatsAppHref: string | null;
  mailtoHref: string | null;
};

export function BirthdayActions({ message, whatsAppHref, mailtoHref }: BirthdayActionsProps) {
  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Le message a été copié.");
    } catch {
      toast.error("Le message n'a pas pu être copié.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={copyMessage}>
        <Copy data-icon="inline-start" />
        Copier
      </Button>
      {whatsAppHref ? (
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-7 items-center justify-center rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary/80"
        >
          WhatsApp
        </a>
      ) : null}
      {mailtoHref ? (
        <a
          href={mailtoHref}
          className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted"
        >
          <Mail className="size-3.5" aria-hidden="true" />
          E-mail
        </a>
      ) : null}
    </div>
  );
}
