"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/layout/brand-mark";

type LoginFormProps = {
  canSetup: boolean;
};

export function LoginForm({ canSetup }: LoginFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);
    const result = await loginAction(formData);
    setPending(false);
    if (result && !result.ok) {
      setMessage(result.message);
    }
  }

  return (
    <div className="rounded-2xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8">
      <BrandMark />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Accès réservé aux gestionnaires de la salle.
      </p>
      <form action={onSubmit} className="mt-6 flex flex-col gap-4">
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
            autoComplete="current-password"
            className="h-11"
            required
          />
        </div>
        {message ? <p className="text-sm text-destructive">{message}</p> : null}
        <Button type="submit" className="h-11" disabled={pending}>
          {pending ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
      {canSetup ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Premier lancement ?{" "}
          <Link href="/setup" className="text-foreground underline-offset-4 hover:underline">
            Créer le compte administrateur
          </Link>
        </p>
      ) : null}
    </div>
  );
}
