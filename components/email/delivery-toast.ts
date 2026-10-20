"use client";

import { toast } from "sonner";
import type { EmailDelivery } from "@/lib/email/types";

export function toastEmailDelivery(delivery: EmailDelivery | undefined) {
  if (!delivery) {
    return;
  }

  if (delivery.status === "sent") {
    toast.success("L'e-mail a été envoyé au membre.");
    return;
  }

  if (delivery.status === "failed") {
    toast.error("L'enregistrement a réussi, mais l'e-mail n'a pas pu partir.");
    return;
  }

  if (delivery.reason === "missing_recipient") {
    toast.message("Pas d'e-mail sur la fiche : le message n'a pas été envoyé.");
    return;
  }

  toast.message("Configurez SMTP pour envoyer les e-mails automatiquement.");
}
