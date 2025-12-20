# PRD — Squar.me (Bento-like clone 1:1, auto-hosté, gratuit)

## Contexte
Bento (bento.me) ferme. Le projet **Squar.me** vise à recréer **une expérience identique**, auto-hébergée, gratuite. Le produit permettait de créer une page publique personnelle basée sur une grille de blocs redimensionnables (link-in-bio).
L’objectif est de recréer Bento **à l’identique**, en auto-hébergé, **100 % gratuit**,
sans modèle payant, sans limites UX artificielles.

---

## Objectif principal
Permettre à un utilisateur de créer et publier une page publique type Bento,
composée d’une grille de blocs **drag & resize libre**, sauvegardée en JSON,
accessible via une URL unique.

---

## Non-objectifs
- Pas de monétisation
- Pas de plans payants
- Pas de publicité
- Pas de fonctionnalités sociales (likes, follows, commentaires)
- Pas de collaboration multi-utilisateurs
- Pas d’analytics avancés
- Pas de marketplace ou templates premium

---

## Fonctionnalités

### Éditeur
- Grille logique de **12 colonnes**
- Positionnement par coordonnées `x, y, w, h`
- Drag & drop libre
- Resize libre avec snapping sur la grille
- Feedback visuel léger (hover, outline, resize handles)
- Autosave
- Undo / redo (stack JSON)

### Types de blocs
- Texte (auto-height)
- Lien (label + URL)
- Image (upload)
- Embed (URL : YouTube, Spotify, etc.)
- Divider (optionnel)

### Images
- Upload direct
- Aucune limite visible côté utilisateur
- Optimisation automatique :
  - Conversion WebP
  - Redimensionnement max 1600px
  - Compression
  - Suppression des métadonnées
- Stockage local sur le serveur

### Page publique
- URL : `/u/[slug]`
- Rendu **SSR**
- HTML le plus statique possible
- SEO + OpenGraph dynamiques
- Chargement rapide, JS minimal voire nul
- Cache HTTP agressif

---

## Contraintes techniques
- Frontend : **SvelteKit + TypeScript**
- Backend : routes SvelteKit
- Base de données : **PostgreSQL ou SQLite**
- Stockage images : disque local
- Déploiement : **Docker + Traefik**
- Aucune dépendance cloud externe obligatoire
- Projet auto-hébergé sur un VPS personnel

---

## Modèle de données

### Block
```ts
type Block = {
  id: string
  type: 'text' | 'link' | 'image' | 'embed' | 'divider'
  x: number
  y: number
  w: number
  h: number
  data: Record<string, any>
}
```

### Page
```ts
Copier le code
type Page = {
  id: string
  userId: string
  slug: string
  layout: Block[]
  published: boolean
  updatedAt: Date
}
```

### User
```ts
Copier le code
type User = {
  id: string
  email: string
  createdAt: Date
}
```

## UX de référence
- Comportement identique à Bento.me
- Drag & resize fluide
- UI minimaliste
- Aucune friction inutile
- Pas d’onboarding lourd
- L’éditeur est l’expérience principale

## Performance & stabilité
- Pages publiques servies via SSR + cache
- Images optimisées systématiquement
- Le layout est stocké et rendu depuis du JSON
- Le renderer public ne dépend pas de l’éditeur

## Règles strictes pour l’implémentation
- Ne pas ajouter de fonctionnalités non listées
- Ne pas proposer de modèle payant
- Ne pas limiter artificiellement l’utilisateur côté UX
- Toujours conserver le resize libre
- Prioriser la fidélité fonctionnelle à Bento
- En cas d’ambiguïté, poser une question plutôt que supposer

## Instruction pour l’IA (Claude)
Tu es un développeur senior spécialisé en SvelteKit.
Ta tâche est d’implémenter ce PRD strictement.
Si une information est manquante ou ambiguë, pose une question avant de continuer. Aucune feature additionnelle n’est autorisée.
