# Roadmap — Squar.me

## Stack confirmée
- **SvelteKit 5** (runes) + **Tailwind 4**
- **MongoDB** : driver officiel MongoDB (mongodb package)
- **BetterAuth** pour l'authentification
- **MinIO** (déjà configuré)
- **Sharp** pour l'optimisation d'images

---

## Ordre d'implémentation

### 1️⃣ Setup initial du projet
- Init SvelteKit 5 + TypeScript + Tailwind 4
- Configuration MongoDB (connexion, types)
- Configuration MinIO (client S3)
- Variables d'environnement

### 2️⃣ Système de design / Composants UI de base
- Architecture des composants (pattern shadcn-like)
- Composants primitifs : Button, Input, Card, Modal, etc.
- Tokens Tailwind (couleurs, spacing, etc.)
- Layout de base (header, container, etc.)

### 3️⃣ Authentification (BetterAuth)
- Setup BetterAuth
- Pages login/signup en utilisant les composants UI
- Protection des routes éditeur

### 4️⃣ Modèle de données + API de base
- Collections MongoDB (User, Page, Block)
- API routes CRUD pour les pages
- Logique de slug unique

### 5️⃣ Éditeur de grille (cœur du produit)
- Grille 12 colonnes avec coordonnées x, y, w, h
- Drag & drop
- Resize avec handles
- Autosave

### 6️⃣ Types de blocs
- Bloc texte (auto-height)
- Bloc lien
- Bloc image (upload → MinIO + Sharp)
- Bloc embed
- Bloc divider

### 7️⃣ Page publique SSR
- Route `/[slug]` avec SSR
- Renderer des blocs depuis JSON
- SEO + OpenGraph
- Cache HTTP

### 8️⃣ Undo/Redo + polish UX
- Stack JSON pour undo/redo
- Feedback visuel (hover, outline, resize handles)
- Optimisations finales

---

## Notes techniques

### MongoDB
- Pas de Prisma (moins adapté à MongoDB)
- Types TypeScript manuels
- Driver officiel pour flexibilité maximale

### Images
- Upload direct via API route SvelteKit → stocke dans MinIO
- Optimisation côté serveur avec Sharp, pas de worker séparé
- Fichiers organisés par `/userId/pageId/<filename>`

### Grille
- Texte = auto-height
- Autres blocs = h redimensionnable librement
- Chevauchement possible
- Grille verticale infinie
