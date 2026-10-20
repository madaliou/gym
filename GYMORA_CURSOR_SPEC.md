# GYMORA — Product & Technical Specification for Cursor

## 0. ROLE

You are a senior full-stack software architect and engineer.

Build a complete, production-quality gym/fitness club management SaaS called **GYMORA** from scratch.

There is currently NO existing project. Initialize the project yourself.

The application must be deployable on **Vercel** and use **MySQL + Prisma**.

Do not create a static mockup. Build a real application with authentication, database persistence, authorization, CRUD operations, business logic, validation, responsive UI, and production-ready architecture.

---

# 1. CORE REQUIREMENTS

GYMORA is a gym management platform for:

- gym owners
- managers
- receptionists
- coaches

Main business areas:

1. Authentication
2. Role-based access control
3. Member management
4. Membership plans
5. Subscriptions
6. Payments
7. Check-ins / attendance
8. Birthday messages
9. Membership expiration reminders
10. Notifications
11. Administrative users
12. Dashboard and analytics
13. Audit logs
14. Gym settings
15. QR code member identification
16. Responsive mobile/tablet/desktop experience

The final application should look like a commercial SaaS product, not a school CRUD project.

---

# 2. LANGUAGE RULE

This rule is mandatory.

## Technical layer: ENGLISH

All technical identifiers must be in English:

- variables
- constants
- functions
- classes
- interfaces
- types
- React components
- hooks
- file names
- folder names
- database models
- database fields
- Prisma models
- Prisma enums
- API routes
- API parameters
- API response fields
- services
- utilities
- query keys
- environment variables

Examples:

```text
member
membership
membershipPlan
subscription
payment
checkIn
birthday
notification
messageTemplate
auditLog
gymSettings
user
```

Never use technical identifiers such as:

```text
membre
abonnement
paiement
presence
anniversaire
utilisateur
```

## User interface: FRENCH

All visible UI text must be French.

Examples:

```text
Dashboard
Membres
Abonnements
Paiements
Présences
Anniversaires
Notifications
Utilisateurs
Paramètres
Journal d'activité
```

Example:

```tsx
const member = ...
```

but:

```tsx
<Button>Ajouter un membre</Button>
```

---

# 3. TECHNOLOGY STACK

Use:

- Next.js latest stable
- App Router
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- Lucide React
- Prisma ORM
- MySQL
- Auth.js / NextAuth
- Zod
- React Hook Form
- TanStack Query where useful
- Recharts
- date-fns
- bcrypt or bcryptjs
- Sonner

Use Server Components by default.

Use Client Components only when necessary.

Use Server Actions or Route Handlers for server-side mutations and APIs where appropriate.

---

# 4. INITIAL PROJECT SETUP

Initialize a clean Next.js TypeScript project.

Use a professional folder structure similar to:

```text
app/
  (auth)/
  (dashboard)/
  api/

components/
  ui/
  layout/
  dashboard/
  members/
  memberships/
  subscriptions/
  payments/
  check-ins/
  birthdays/
  notifications/
  users/
  settings/

lib/
  auth/
  db/
  permissions/
  services/
  validations/
  utils/

prisma/
  schema.prisma
  seed.ts

types/

public/

README.md
.env.example
```

Adapt the structure if a better architecture is justified.

Do not over-engineer.

---

# 5. VISUAL IDENTITY

Application name:

**GYMORA**

Design direction:

- futuristic
- premium
- clean
- minimal
- professional
- elegant
- modern
- high-end SaaS
- fitness-oriented without looking like a gaming application

Design references:

- Vercel
- Linear
- Stripe
- Apple
- Notion
- premium fitness SaaS products

Default:

- dark mode

Also support:

- light mode

Visual characteristics:

- deep dark background
- subtle borders
- clean typography
- generous spacing
- modern cards
- subtle gradients
- very subtle glass effects
- smooth micro-interactions
- excellent hover/focus states
- modern data tables
- elegant badges

Do not overuse animations.

The interface should feel fast and premium.

---

# 6. RESPONSIVE DESIGN

The entire application must work on:

- desktop
- laptop
- tablet
- mobile

Mobile behavior:

- sidebar becomes a drawer
- tables adapt to cards where appropriate
- forms stack properly
- dashboard cards stack
- navigation remains accessible
- buttons are touch-friendly

---

# 7. AUTHENTICATION

Implement complete authentication using Auth.js / NextAuth.

Initial authentication:

- email/password

Features:

- login
- logout
- secure session
- protected routes
- unauthorized handling
- profile
- change password
- password reset architecture
- last login tracking

Passwords must be hashed.

Never store plaintext passwords.

Never expose authentication secrets to the browser.

---

# 8. ROLES AND PERMISSIONS

Roles:

```text
ADMIN
MANAGER
RECEPTIONIST
COACH
```

Permissions:

## ADMIN

Full access:

- dashboard
- members
- membership plans
- subscriptions
- payments
- check-ins
- birthdays
- notifications
- users
- audit logs
- settings

## MANAGER

Access:

- members
- membership plans
- subscriptions
- payments
- check-ins
- dashboard
- notifications
- reports

## RECEPTIONIST

Access:

- members
- subscriptions
- payments
- check-ins
- birthdays

## COACH

Access:

- relevant members
- attendance
- check-ins
- limited member information

RBAC must be enforced server-side.

Hiding a menu item is NOT sufficient.

Every protected server action/API must verify permissions.

---

# 9. DATABASE

Use:

```text
MySQL + Prisma
```

Do not use SQLite.

Use Prisma migrations.

Use UUID or cuid identifiers.

Every major model should include:

```text
id
createdAt
updatedAt
```

Use indexes and unique constraints appropriately.

---

# 10. MAIN DATABASE MODELS

Create at least:

```text
User
Member
MembershipPlan
Subscription
Payment
CheckIn
Notification
MessageTemplate
AuditLog
GymSettings
```

Optional supporting models if needed:

```text
PasswordResetToken
BirthdayMessageLog
```

---

# 11. USER MODEL

Fields:

```text
id
firstName
lastName
email
passwordHash
role
isActive
lastLoginAt
createdAt
updatedAt
```

Email must be unique.

---

# 12. MEMBER MANAGEMENT

Create a complete member system.

Member fields:

```text
id
firstName
lastName
email
phone
gender
dateOfBirth
photoUrl
address
city
emergencyContactName
emergencyContactPhone
notes
status
joinedAt
createdAt
updatedAt
```

Statuses:

```text
ACTIVE
INACTIVE
SUSPENDED
ARCHIVED
```

Features:

- create member
- edit member
- view member
- archive member
- search
- filtering
- sorting
- pagination
- member history
- current subscription
- payment history
- attendance history
- expiration date

Routes:

```text
/dashboard/members
/dashboard/members/new
/dashboard/members/[id]
```

---

# 13. MEMBERSHIP PLANS

Plans must be configurable.

Examples:

```text
BASIC
STANDARD
PREMIUM
VIP
```

Fields:

```text
id
name
description
price
durationDays
features
isActive
createdAt
updatedAt
```

Do not hardcode plans into the UI.

Example:

```text
Premium
30 jours
25 000 FCFA
```

---

# 14. SUBSCRIPTIONS

A subscription represents a member purchasing a membership plan.

Fields:

```text
id
memberId
membershipPlanId
startDate
endDate
status
price
discount
amountPaid
remainingAmount
createdAt
updatedAt
```

Statuses:

```text
ACTIVE
EXPIRED
PENDING
SUSPENDED
CANCELLED
```

Features:

- create subscription
- renew
- suspend
- reactivate
- cancel
- calculate expiration
- calculate remaining balance
- history

Never overwrite historical subscriptions.

---

# 15. PAYMENTS

Payment methods:

```text
CASH
CARD
MOBILE_MONEY
BANK_TRANSFER
OTHER
```

Payment fields:

```text
id
memberId
subscriptionId
amount
method
reference
paidAt
recordedBy
notes
createdAt
updatedAt
```

Support:

- full payment
- partial payment
- payment history
- filters
- date ranges
- printable receipt
- CSV export if practical

Example:

```text
Abonnement : 30 000 FCFA
Payé : 20 000 FCFA
Reste : 10 000 FCFA
```

---

# 16. CHECK-IN / ATTENDANCE

Create:

```text
/dashboard/check-ins
```

Features:

- search member
- check-in
- timestamp
- attendance history
- today's attendance
- last visit
- total visits

Dashboard metrics:

- today's check-ins
- weekly check-ins
- monthly check-ins

---

# 17. QR CODE

Every member should have a unique QR code.

The QR code should identify the member.

Member detail should display the QR code.

Design the architecture so QR scanning can be added cleanly.

---

# 18. DASHBOARD

Create a premium dashboard.

Metrics:

- total members
- active members
- expired memberships
- memberships expiring soon
- monthly revenue
- today's revenue
- today's check-ins
- new members

Charts:

- revenue by month
- member growth
- subscriptions by month
- attendance
- membership plan distribution

Use Recharts.

All data must come from MySQL.

Never hardcode dashboard numbers.

---

# 19. BIRTHDAY MANAGEMENT

Create a dedicated birthday module.

Automatically detect members whose birthday is today.

Dashboard section:

```text
Anniversaires aujourd'hui
```

Display:

- photo
- name
- age
- phone
- email

Actions:

- copy message
- open WhatsApp
- send email

Default template:

```text
🎉 Joyeux anniversaire {firstName} !
Toute l'équipe GYMORA te souhaite une excellente journée et beaucoup de réussite.
Profite pleinement de cette nouvelle année ! 💪
```

Supported variables:

```text
{firstName}
{lastName}
{age}
{gymName}
```

WhatsApp:

Generate a properly encoded:

```text
https://wa.me/{phone}?text={encodedMessage}
```

Do not claim a message was sent unless an actual external messaging API is configured.

Prepare architecture for future:

- WhatsApp API
- SMS provider
- email provider

---

# 20. EXPIRATION REMINDERS

Detect:

- expired today
- expiring in 1 day
- expiring in 3 days
- expiring in 7 days
- expiring in 30 days

Display alerts in the dashboard.

Prepare architecture for automated notifications later.

---

# 21. NOTIFICATIONS

Create internal notifications.

Examples:

- membership expiring
- membership expired
- birthday
- payment received
- new member

Topbar notification center:

- unread count
- mark as read
- mark all as read

---

# 22. ADMINISTRATIVE USERS

Route:

```text
/dashboard/users
```

ADMIN can:

- create users
- edit users
- disable users
- change roles
- reset passwords
- see last login

Display:

- name
- email
- role
- status
- last login
- creation date

---

# 23. AUDIT LOG

Track important actions:

- login
- logout
- member creation
- member update
- member archive
- subscription creation
- subscription renewal
- payment creation
- user creation
- role change
- settings changes

Fields:

```text
id
userId
action
entity
entityId
metadata
ipAddress
createdAt
```

Route:

```text
/dashboard/audit-logs
```

ADMIN only.

---

# 24. MESSAGE TEMPLATES

Create configurable message templates.

Fields:

```text
id
name
type
content
isActive
createdAt
updatedAt
```

Types:

```text
BIRTHDAY
EXPIRATION
WELCOME
PAYMENT
OTHER
```

Templates support variables.

Example:

```text
Bonjour {firstName},

Votre abonnement expire le {endDate}.

Merci,
{gymName}
```

---

# 25. FINANCE DASHBOARD

Create a finance section.

Show:

- today's revenue
- weekly revenue
- monthly revenue
- yearly revenue
- total payments
- payment method distribution

Charts:

- revenue evolution
- revenue by payment method
- revenue by membership plan

---

# 26. SETTINGS

Create:

```text
/dashboard/settings
```

Sections:

## General

- gym name
- logo
- phone
- email
- address
- currency
- timezone

## Notifications

- birthday messages
- expiration reminders
- message templates

## Appearance

- theme
- accent color

## Security

- session settings
- password policy

Default timezone:

```text
Africa/Dakar
```

Default currency:

```text
XOF / FCFA
```

Make them configurable.

---

# 27. SEARCH / FILTERS / TABLES

Important lists must support:

- search
- sorting
- pagination
- filters
- loading state
- empty state
- error state

Member search:

- first name
- last name
- email
- phone

Subscription filters:

- active
- expired
- pending
- suspended

Payment filters:

- member
- method
- date range

---

# 28. VALIDATION

Use Zod.

Validate server-side:

- login
- member creation
- member updates
- plans
- subscriptions
- payments
- users
- settings
- message templates

Never trust client validation alone.

---

# 29. API / SERVER ACTIONS

Use Server Actions and Route Handlers appropriately.

Possible API routes:

```text
/api/auth/*
/api/members/*
/api/membership-plans/*
/api/subscriptions/*
/api/payments/*
/api/check-ins/*
/api/users/*
/api/notifications/*
/api/messages/*
```

Keep business logic outside UI components.

---

# 30. SERVICES

Create service modules where useful:

```text
memberService
membershipPlanService
subscriptionService
paymentService
checkInService
birthdayService
notificationService
messageService
userService
auditLogService
settingsService
```

Do not over-engineer simple operations.

---

# 31. SECURITY

Implement:

- password hashing
- secure authentication
- server-side authorization
- RBAC
- input validation
- secure cookies/session
- safe error handling
- no secrets in frontend
- no DATABASE_URL in client code
- no AUTH_SECRET in NEXT_PUBLIC variables
- proper access control

---

# 32. ENVIRONMENT VARIABLES

Create:

```text
.env.example
```

Use:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/gymora"

AUTH_SECRET="CHANGE_ME"
NEXTAUTH_SECRET="CHANGE_ME"

AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"

UPLOADS_DIR="./public/uploads"
```

All environment variable names must be English.

Never hardcode secrets.

---

# 33. VERCEL

The application must be Vercel-compatible.

Do not depend on:

- local persistent filesystem
- SQLite
- localhost MySQL
- long-running background processes

Use remote MySQL through:

```text
DATABASE_URL
```

Uploads must not rely on local filesystem persistence in production.

Create a storage abstraction that can later support:

- Vercel Blob
- Cloudinary
- AWS S3

---

# 34. SEED

Create:

```text
prisma/seed.ts
```

Seed admin:

```text
email:
admin@gymora.local

password:
Admin@123456
```

Seed plans:

```text
Basic
Standard
Premium
VIP
```

Seed a few development members.

Document clearly that the seed password must be changed in production.

---

# 35. PRISMA

Support:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Use proper Prisma relations.

Use indexes for frequently queried fields.

Do not put unnecessary business logic inside Prisma schema.

---

# 36. UI COMPONENTS

Use shadcn/ui.

Create reusable components where appropriate:

```text
DataTable
PageHeader
StatCard
EmptyState
ErrorState
LoadingSkeleton
ConfirmDialog
SearchInput
FilterBar
StatusBadge
CurrencyDisplay
DateDisplay
MemberAvatar
UserAvatar
NotificationDropdown
```

Avoid unnecessary duplication.

---

# 37. SIDEBAR

Menu in French:

```text
DASHBOARD

Dashboard

MEMBRES

Membres
Ajouter un membre
Présences

ABONNEMENTS

Plans
Souscriptions
Abonnements expirants

FINANCES

Paiements
Revenus

COMMUNICATION

Anniversaires
Messages
Notifications

ADMINISTRATION

Utilisateurs
Journal d'activité
Paramètres
```

Menu visibility must depend on the user's role.

---

# 38. MEMBER DETAIL

Create a premium member profile.

Display:

- photo
- full name
- status
- contact information
- current membership
- expiration date
- payment status
- total payments
- attendance count
- recent activity
- QR code

Tabs:

```text
Vue d'ensemble
Abonnements
Paiements
Présences
Activité
```

---

# 39. UX STATES

Every feature must have:

- loading
- success
- error
- empty
- confirmation

Examples:

```text
Le membre a été ajouté avec succès.
Le paiement a été enregistré.
Les informations ont été mises à jour.
Une erreur est survenue.
Aucun membre trouvé.
```

Use Sonner for toasts.

---

# 40. ACCESSIBILITY

Follow accessibility best practices:

- semantic HTML
- keyboard navigation
- focus states
- accessible labels
- good contrast
- accessible dialogs
- accessible dropdowns
- accessible forms

---

# 41. PERFORMANCE

Optimize for:

- Server Components
- minimal client JavaScript
- efficient Prisma queries
- pagination
- indexes
- image optimization
- lazy loading when useful
- avoiding unnecessary requests

---

# 42. TYPESCRIPT / CODE QUALITY

Use strict TypeScript.

Avoid:

```text
any
@ts-ignore
eslint-disable
```

unless absolutely necessary.

Do not suppress errors to make the build pass.

Keep:

- functions focused
- components reusable
- business logic separate from UI
- types explicit
- API responses typed

---

# 43. DEPENDENCY MANAGEMENT

Do not blindly install packages.

Before adding a dependency:

1. Check whether it is already installed.
2. Check compatibility with the current Next.js/React version.
3. Prefer maintained stable versions.
4. Avoid duplicate libraries serving the same purpose.

Do not use:

```bash
npm install --force
```

or:

```bash
npm install --legacy-peer-deps
```

as a permanent solution.

Resolve dependency conflicts properly.

---

# 44. README

Create a complete README.md.

Include:

- project overview
- architecture
- prerequisites
- installation
- environment variables
- MySQL configuration
- Prisma configuration
- migrations
- seed
- development
- production build
- Vercel deployment
- authentication
- roles
- database structure
- storage architecture

Commands:

```bash
npm install

npx prisma generate

npx prisma migrate dev

npx prisma db seed

npm run dev

npm run build
```

---

# 45. DEVELOPMENT PHASES

Do not implement everything in one huge uncontrolled operation.

Work in phases.

## PHASE 1

Initialize the project.

- Next.js
- TypeScript
- Tailwind
- shadcn/ui
- dependencies
- ESLint
- basic architecture

## PHASE 2

Database.

- Prisma
- MySQL
- schema
- migrations
- seed

## PHASE 3

Authentication.

- Auth.js
- credentials login
- password hashing
- sessions
- RBAC

## PHASE 4

Dashboard shell.

- sidebar
- topbar
- theme
- responsive layout

## PHASE 5

Members.

## PHASE 6

Membership plans.

## PHASE 7

Subscriptions.

## PHASE 8

Payments.

## PHASE 9

Check-ins.

## PHASE 10

Dashboard analytics.

## PHASE 11

Birthday system.

## PHASE 12

Expiration reminders.

## PHASE 13

Notifications.

## PHASE 14

Administrative users.

## PHASE 15

Audit logs.

## PHASE 16

Settings.

## PHASE 17

Responsive polish.

## PHASE 18

Security review.

## PHASE 19

Performance optimization.

## PHASE 20

Production build and deployment preparation.

---

# 46. CURSOR WORKFLOW

After each major phase:

1. Run TypeScript checks.
2. Run ESLint.
3. Run relevant tests.
4. Run Prisma validation when relevant.
5. Run production build when appropriate.
6. Fix errors before moving forward.

Do not continue while there are obvious build/type errors.

Before changing an existing file:

- inspect it
- understand its role
- modify minimally

When creating new functionality:

- keep it modular
- reuse existing components
- avoid duplication

---

# 47. FINAL PRODUCT

The final application must feel like a real premium SaaS product.

It must provide:

- secure authentication
- role-based administration
- member management
- membership plans
- subscriptions
- payments
- attendance
- QR code support
- birthday messaging
- expiration reminders
- notifications
- audit logs
- financial reporting
- dashboard analytics
- settings
- responsive design
- MySQL
- Prisma
- Vercel compatibility

The UI is French.

All technical identifiers are English.

The application should be production-ready.

---

# 48. FIRST ACTION

Start immediately.

First:

1. Initialize the Next.js project.
2. Install the required dependencies.
3. Create the base architecture.
4. Configure Tailwind and shadcn/ui.
5. Create the initial premium GYMORA layout.
6. Create .env.example.
7. Configure Prisma for MySQL.
8. Do not implement every module at once.

After completing the initial setup, verify:

```bash
npm run lint
npm run build
```

Then continue to the database phase.

Do not ask unnecessary questions. Make sensible technical decisions and document important decisions in README.md.
