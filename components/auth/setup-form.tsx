"use client";

import { useState } from "react";
import { setupAdminAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/layout/brand-mark";

export function SetupForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await setupAdminAction(formData);
    setPending(false);
    if (result && !result.ok) {
      setMessage(result.message);
    }
  }

  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
      <BrandMark />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Premier administrateur</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Créez le compte qui gérera les accès de l&apos;équipe.
      </p>
      <form action={onSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" name="firstName" className="h-11" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" name="lastName" className="h-11" required />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" className="h-11" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="h-11"
            required
          />
          <p className="text-xs text-muted-foreground">10 caractères minimum, avec au moins une lettre et un chiffre.</p>
        </div>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
        <Button type="submit" className="h-11" disabled={pending}>
          {pending ? "Création..." : "Créer le compte"}
        </Button>
      </form>
    </div>
  );
}
