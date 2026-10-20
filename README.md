# GYMORA

GYMORA est une plateforme de gestion pour clubs de fitness. Elle est destinée aux propriétaires, managers, équipes d'accueil et coachs.

Cette version correspond à la **phase 1** : fondation technique, design system et préparation de la base MySQL. L'authentification, le schéma métier et les modules opérationnels arrivent dans les phases suivantes.

L'interface est en français. Les identifiants techniques (fichiers, variables, modèles, routes) sont en anglais.

## Architecture

```text
app/
  (auth)/          Shell des futures pages de connexion
  (dashboard)/     Application de gestion : sidebar, topbar, modules
  api/             Route handlers (phases suivantes)
components/
  ui/              shadcn/ui
  layout/          Coque de l'application, navigation, thème
  dashboard/       En-têtes, indicateurs, états vides
lib/
  config.ts        Nom de l'application, fuseau et devise par défaut
  db/prisma.ts     Client Prisma (connexion paresseuse)
  storage/         Abstraction de fichiers distants
prisma/
  schema.prisma    Connexion MySQL, sans modèles métier pour l'instant
prisma7.config.ts  Configuration Prisma 7
```

Décisions de cette phase :

- **Next.js 16** (App Router), **React 19**, **TypeScript strict**, **Tailwind CSS 4**.
- **shadcn/ui 4**, style `base-nova` (Base UI), icônes Lucide. C'est le preset officiel actuel de shadcn.
- **Thème sombre par défaut**, thème clair disponible. Le choix est mémorisé dans le navigateur via `next-themes`. Le système d'exploitation n'est pas suivi, pour garder le sombre comme défaut produit.
- **Prisma 7** avec le générateur `prisma-client`, MySQL, et l'adaptateur `@prisma/adapter-mariadb`. L'URL reste dans `DATABASE_URL`, lue par `prisma7.config.ts`. Aucun modèle, aucune migration et aucun seed dans cette phase.
- Le client Prisma n'ouvre pas de connexion au chargement du module. `getPrismaClient()` se connecte seulement lorsqu'un module métier l'appelle.
- **Stockage** : interface uniquement (`vercel-blob`, `cloudinary`, `s3`). Le disque local n'est pas utilisé en production, pour rester compatible avec Vercel.
- Les dépendances des phases suivantes (Auth.js, Zod, React Hook Form, TanStack Query, Recharts, date-fns, bcrypt, Sonner) seront ajoutées quand leur module sera construit.
- Fuseau par défaut prévu pour les paramètres : `Africa/Dakar`. Devise par défaut : `XOF` (FCFA). Ils sont déclarés dans `lib/config.ts` et deviendront configurables avec les paramètres du club.

## Prérequis

- Node.js 22
- npm
- Une base **MySQL** distante ou locale, accessible via `DATABASE_URL`

SQLite n'est pas utilisé.

## Installation

```bash
npm install
```

`postinstall` exécute `prisma generate`.

Copier les variables d'environnement :

```bash
cp .env.example .env
```

Renseigner au minimum `DATABASE_URL` avant toute migration.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion MySQL (`mysql://USER:PASSWORD@HOST:3306/gymora`) |
| `AUTH_SECRET` | Secret de session Auth.js (phase 3) |
| `NEXTAUTH_SECRET` | Alias historique du secret Auth.js |
| `AUTH_URL` | URL canonique de l'application |
| `NEXTAUTH_URL` | Alias historique de l'URL Auth.js |
| `NEXT_PUBLIC_APP_URL` | URL publique, exposée au navigateur |
| `NEXT_PUBLIC_API_URL` | Préfixe des routes API |
| `UPLOADS_DIR` | Emplacement local réservé au développement. Ne pas s'en servir comme stockage durable en production |

Ne jamais préfixer `DATABASE_URL`, `AUTH_SECRET` ou `NEXTAUTH_SECRET` par `NEXT_PUBLIC_`.

## MySQL

Créer une base vide, par exemple `gymora`, puis placer sa chaîne de connexion dans `.env` :

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/gymora"
```

En production, utiliser une base MySQL distante. L'application ne dépend pas d'un MySQL uniquement disponible sur `localhost`.

## Prisma

Le schéma déclare le provider `mysql`, le générateur du client et le modèle `Member`, utilisé par la création de membre.

En local, MySQL peut être démarré avec `brew services start mysql`, puis :

```sql
CREATE DATABASE IF NOT EXISTS gymora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```env
DATABASE_URL="mysql://root@127.0.0.1:3306/gymora"
```

```bash
npx prisma generate
npx prisma migrate dev
```

`prisma migrate dev` nécessite une base joignable. La migration `add_member` crée la table des membres.

Le client généré est écrit dans `lib/generated/prisma` et n'est pas versionné.

## Seed

Le script `prisma/seed.ts` n'existe pas encore. Il sera ajouté en phase 2, avec un administrateur de développement :

```text
email: admin@gymora.local
password: Admin@123456
```

Ce mot de passe devra être changé avant toute utilisation réelle. Il ne doit pas rester en production.

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). L'accueil redirige vers l'application de gestion, `/dashboard`.

## Build de production

```bash
npm run lint
npm run typecheck
npm run build
npm start
```

## Déploiement Vercel

1. Créer un projet Vercel à partir de ce dépôt.
2. Définir les variables d'environnement de `.env.example` dans les réglages du projet.
3. Pointer `DATABASE_URL` vers le MySQL de production.
4. Laisser la commande de build par défaut (`next build`). `postinstall` génère le client Prisma.

Contraintes respectées dès cette phase :

- pas de SQLite
- pas de processus d'arrière-plan permanent
- les photos de membres sont enregistrées dans `public/uploads/members`

## Authentification

Prévue en phase 3 avec Auth.js : e-mail et mot de passe, session, routes protégées, hash des mots de passe. Rien de cela n'est branché pour l'instant. Les secrets restent dans les variables d'environnement.

## Rôles

Prévus : `ADMIN`, `MANAGER`, `RECEPTIONIST`, `COACH`. Le contrôle d'accès sera appliqué côté serveur. Masquer un menu ne suffira pas.

## Structure de la base

Phase 1 : connexion MySQL uniquement.

Phase 2 : modèles, index, migrations et données de démonstration.

## Stockage

La photo d'un membre est un fichier image. Elle est enregistrée dans `public/uploads/members`, le dossier indiqué par `UPLOADS_DIR`. L'adresse publique, par exemple `/uploads/members/<fichier>.jpg`, est stockée dans `photoUrl`. Les formats acceptés sont JPG, PNG et WebP, jusqu'à 5 Mo.
