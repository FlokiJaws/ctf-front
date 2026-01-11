# Documentation Frontend - Plateforme CTF RootYou

## Vue d'ensemble

Le frontend de la plateforme est construit avec React et suit une architecture moderne orientée composants. L'objectif était de créer une interface intuitive, performante et facile à maintenir.

## Technologies utilisées

### Stack principal
- **React 19.2.0** : Framework UI avec hooks
- **Vite 7.2.4** : Outil de build ultra-rapide qui remplace Create React App
- **React Router DOM 7.9.6** : Gestion de la navigation
- **Tailwind CSS 3.4.17** : Framework CSS utility-first
- **Axios 1.13.2** : Client HTTP pour communiquer avec le backend
- **React Hook Form + Zod** : Gestion des formulaires avec validation

### Bibliothèques complémentaires
- **Radix UI** : Composants accessibles sans style (headless)
- **Lucide React** : Icônes
- **jwt-decode** : Décodage des tokens JWT
- **class-variance-authority** : Gestion des variantes de composants

## Organisation du code

Le code est organisé de façon logique par type de fonctionnalité :

```
src/
├── pages/              # Pages de l'application
│   ├── auth/          # Connexion, inscription (2 pages)
│   ├── participant/   # Interface participant (10 pages)
│   ├── organisateur/  # Interface organisateur (3 pages)
│   └── admin/         # Interface admin (9 pages)
├── components/        # Composants réutilisables
│   ├── ui/           # Design system (Button, Card, Input, etc.)
│   ├── common/       # Composants métier (Pagination, FormField, etc.)
│   ├── ctf/          # Composants spécifiques aux CTF
│   └── layout/       # Navbar, Footer
├── hooks/            # Hooks personnalisés (useAuth, useFormatDate)
├── lib/              # Utilitaires
└── App.jsx           # Configuration des routes
```

Au total : 30 pages, environ 6000 lignes de code.

## Authentification JWT

### Comment ça fonctionne

L'authentification repose sur un système de tokens JWT (comme dans le backend). Voici le flux :

1. L'utilisateur se connecte via le formulaire de login
2. Le backend renvoie un token JWT si les credentials sont bons
3. Le token est stocké dans le localStorage du navigateur
4. À chaque requête API, le token est automatiquement ajouté dans le header Authorization
5. À chaque navigation, on vérifie que le token est valide et non expiré

### Le hook useAuth

J'ai créé un hook personnalisé `useAuth()` qui centralise toute la logique d'authentification. Ce hook est utilisé dans chaque page protégée.

**Ce qu'il fait :**
- Récupère le token depuis localStorage
- Décode le token pour extraire l'email, le pseudo et le rôle
- Vérifie que le token n'est pas expiré
- Contrôle que l'utilisateur a le bon rôle pour accéder à la page
- Redirige vers /login si pas connecté
- Redirige vers /profile si le rôle n'est pas autorisé

**Exemple d'utilisation dans une page :**
```javascript
const user = useAuth(['PARTICIPANT']); // Seuls les participants peuvent accéder
if (!user) return null; // Attend la vérification
```

### Les 3 rôles

Comme dans le backend, on a 3 types d'utilisateurs :
- **PARTICIPANT** : Peut s'inscrire aux CTF, gérer son équipe, envoyer des messages
- **ORGANISATEUR** : Peut créer des CTF, gérer les participants
- **ADMINISTRATEUR** : Peut valider les CTF, modérer, bannir des utilisateurs

## Routing et navigation

L'application utilise React Router avec plus de 25 routes différentes.

### Routes publiques (accessibles sans connexion)
- `/` : Page d'accueil avec les 3 CTF les plus populaires
- `/login` : Connexion
- `/register` : Inscription

### Routes participant
- `/my-ctfs` : Mes CTF (ceux auxquels je participe)
- `/all-ctfs` : Liste complète des CTF
- `/ctf/:id` : Détails d'un CTF
- `/my-team` : Gestion de mon équipe
- `/teams` : Liste de toutes les équipes
- `/defis` : Liste des défis
- `/leaderboard` : Classement

### Routes organisateur
- `/organizer-ctfs` : Mes CTF créés
- `/organizer-ctfs/create` : Créer un nouveau CTF
- `/organizer-ctfs/:id/edit` : Modifier un CTF

### Routes admin
- `/admin/dashboard` : Tableau de bord
- `/admin/ctf-validation` : Valider les CTF en attente
- `/admin/teams` : Gérer les équipes
- `/admin/users` : Gérer les utilisateurs
- Et plusieurs autres...

### Routes partagées (tous les rôles)
- `/profile` : Mon profil
- `/messaging` : Mes conversations
- `/conversation/:id` : Une conversation

### Protection des routes

Chaque page protégée utilise le hook `useAuth()` avec les rôles autorisés. Si l'utilisateur n'a pas le bon rôle, il est redirigé automatiquement.

## Design system et styling

### Approche Tailwind CSS

Le projet utilise Tailwind CSS en mode "utility-first". Ça veut dire qu'au lieu d'écrire du CSS dans des fichiers séparés, on applique des classes utilitaires directement dans le HTML.

**Avantages :**
- Cohérence visuelle : toutes les couleurs et espacements viennent de la même palette
- Rapidité : pas besoin de changer de fichier entre HTML et CSS
- Pas de CSS mort : quand on supprime un composant, son CSS disparaît aussi
- Mode responsive facile : `sm:`, `md:`, `lg:` pour les breakpoints
- Mode sombre intégré : classe `dark:` pour les styles alternatifs

### Thème clair/sombre

Le site supporte un mode sombre et un mode clair. Le système repose sur des variables CSS (design tokens) définies dans `index.css`.

**Variables principales :**
- `--background` : Couleur de fond
- `--foreground` : Couleur du texte
- `--primary` : Couleur principale (boutons, liens)
- `--destructive` : Actions dangereuses (suppression)
- `--border` : Bordures
- `--muted` : Texte atténué

Quand l'utilisateur clique sur le toggle dans la Navbar, la classe `dark` est ajoutée à la balise `<html>`. Les variables CSS sont alors remplacées par leurs équivalents sombres.

### Composants UI réutilisables

J'ai créé un mini design system dans `components/ui/` avec des composants de base :

**Button**
- Plusieurs variantes : default, destructive, outline, secondary, ghost, link
- Plusieurs tailles : default, sm, lg, icon
- Gère automatiquement l'état disabled

**Card**
- Système composable : Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Utilisé partout pour afficher les CTF, équipes, etc.

**Input, Label, Textarea**
- Inputs stylisés avec le thème
- Compatible React Hook Form grâce à `forwardRef`

Tous ces composants sont basés sur Radix UI, ce qui garantit l'accessibilité (navigation clavier, lecteurs d'écran, etc.).

## Gestion des formulaires

Les formulaires utilisent React Hook Form avec Zod pour la validation.

**React Hook Form :**
- Performant : re-renders minimaux
- Simple à utiliser
- Gestion automatique de l'état du formulaire

**Zod :**
- Validation par schéma
- Messages d'erreur personnalisables
- Validation côté client avant envoi au backend

**Composant FormField :**
J'ai créé un wrapper qui standardise l'affichage des champs :
- Label avec indicateur "requis"
- Input avec bordure rouge si erreur
- Message d'erreur en rouge en dessous
- Style cohérent partout

## Communication avec le backend

### Configuration Axios

Axios est configuré pour :
- Communiquer avec `http://localhost:8080`
- Ajouter automatiquement le header `Authorization: Bearer <token>` à chaque requête
- Gérer les erreurs de manière cohérente

### Gestion des erreurs

Quand le backend renvoie une erreur (via ApiException), le frontend :
1. Récupère le message dans `error.response.data.message`
2. L'affiche à l'utilisateur (généralement en rouge)
3. Utilise un message générique si le backend ne renvoie rien

Ça permet d'afficher les codes d'erreur définis dans le backend (CTF_NOT_FOUND, EQUIPENAME_ALREADY_EXISTS, etc.).

## Composants métier principaux

### Navbar

La barre de navigation s'adapte au rôle de l'utilisateur :
- Affiche uniquement les liens pertinents pour le rôle
- Menu dropdown avec profil et déconnexion
- Toggle pour basculer entre mode clair/sombre
- Badge avec le nombre de messages non lus
- Dialog de confirmation avant déconnexion

### CtfCard

Carte d'affichage d'un CTF avec :
- Titre, description, difficulté, catégorie
- Nombre de participants
- Date de création
- Mode "featured" pour mettre en avant les CTF populaires
- Clic pour accéder aux détails

### Pagination

Composant intelligent qui :
- Affiche au max 5 numéros de page
- Utilise des ellipses (...) pour les grandes listes
- Boutons Précédent/Suivant désactivés aux limites

### StatusBadge

Badge coloré pour afficher un statut :
- ACTIF (vert)
- EN_ATTENTE (jaune)
- INACTIF (rouge)

### ConfirmDialog

Boîte de dialogue modale pour confirmer les actions destructrices :
- Suppression
- Exclusion d'un membre
- Bannissement
- Quitter une équipe

## Pages principales

### Home (Page d'accueil)

Affiche les 3 CTF les plus populaires (triés par nombre de vues) dans une grille. Encourage les visiteurs à explorer la plateforme.

### Login et Register

Formulaires d'authentification avec :
- Validation côté client
- Affichage des erreurs backend
- Stockage du token après connexion
- Redirection automatique

### CtfDetail (Détails d'un CTF)

Page complexe qui affiche :
- Toutes les infos du CTF
- Section commentaires (liste + formulaire)
- Liste des défis
- Badge de statut de participation
- Boutons d'action selon le statut :
  - "Rejoindre" si pas inscrit
  - "Quitter" si inscrit et actif
  - "Marquer comme terminé" si en cours

La page détecte automatiquement le statut et adapte l'interface.

### AllCtfs (Liste des CTF)

Liste paginée de tous les CTF disponibles avec :
- Pagination côté client
- Filtres de recherche
- Tri par différents critères

### MyTeam (Gestion d'équipe)

Interface différente selon le rôle dans l'équipe :

**Chef d'équipe :**
- Voir les candidatures en attente
- Accepter/refuser les demandes
- Exclure des membres
- Modifier les infos de l'équipe

**Membre :**
- Voir les infos de l'équipe
- Voir les autres membres
- Quitter l'équipe

**Sans équipe :**
- Créer une nouvelle équipe
- Candidater à une équipe existante

### AdminDashboard (Tableau de bord admin)

Hub administrateur avec onglets pour :
- Gestion des CTF
- Gestion des utilisateurs
- Gestion des équipes
- Statistiques

Vérifie le rôle ADMINISTRATEUR et redirige sinon.

### CreateCtf (Création de CTF)

Formulaire complexe pour créer un CTF :
- Titre, description
- Difficulté, catégorie
- Récompenses
- Image
- Validation Zod avant soumission
- Envoi au backend pour validation par un admin

### Messaging et Conversation

**Messaging :**
- Liste de toutes les conversations
- Badge avec le nombre de messages non lus
- Clic pour ouvrir une conversation

**Conversation :**
- Thread complet des messages
- Formulaire d'envoi de nouveau message
- Messages en temps quasi-réel (refresh au chargement)

## Récapitulatif des fichiers

### Configuration

**vite.config.js**
Configuration de Vite avec le plugin React et un alias `@` pointant vers `src/`.

**tailwind.config.js**
Configuration Tailwind avec les tokens de design, le mode sombre et les animations.

**jsconfig.json**
Configuration pour l'autocomplétion IDE avec l'alias `@`.

### Points d'entrée

**index.html**
Template HTML minimal avec une div `#root`.

**src/main.jsx**
Bootstrap React qui monte l'application.

**src/App.jsx**
Configuration de toutes les routes et gestion du thème.

**src/index.css**
Imports Tailwind + définition des design tokens (variables CSS).

### Hooks personnalisés

**hooks/useAuth.js**
Gestion de l'authentification JWT et contrôle d'accès par rôle.

**hooks/useFormatDate.js**
Formatage des dates en français.

### Utilitaires

**lib/utils.js**
Fonction `cn()` pour merger des classes Tailwind sans conflits.

### Composants UI (Design System)

**ui/button.jsx**
Bouton avec variantes et tailles.

**ui/card.jsx**
Système de cartes composables.

**ui/input.jsx**
Input stylisé.

**ui/label.jsx**
Label accessible.

**ui/textarea.jsx**
Textarea stylisé.

### Composants communs

**common/FormField.jsx**
Wrapper Input+Label+Erreurs standardisé.

**common/Pagination.jsx**
Pagination intelligente avec ellipses.

**common/StatusBadge.jsx**
Badge de statut coloré.

**common/ConfirmDialog.jsx**
Dialog de confirmation pour actions destructrices.

### Composants CTF

**ctf/CtfCard.jsx**
Carte d'affichage d'un CTF.

**ctf/ParticipantsManagement.jsx**
Gestion des participants d'un CTF.

### Layout

**layout/Navbar.jsx**
Barre de navigation adaptative avec profil, toggle thème et messages.

### Pages (24 pages au total)

**Pages publiques :**
- Home.jsx : Landing page
- auth/Login.jsx : Connexion
- auth/Register.jsx : Inscription

**Pages participant (10) :**
- AllCtfs.jsx : Liste de tous les CTF
- CtfDetail.jsx : Détails d'un CTF
- MyCtfs.jsx : Mes CTF
- MyTeam.jsx : Mon équipe
- Teams.jsx : Toutes les équipes
- TeamDetail.jsx : Détails d'une équipe
- Defis.jsx : Liste des défis
- DefisDetail.jsx : Détails d'un défi
- Leaderboard.jsx : Classement
- Profile.jsx : Mon profil

**Pages organisateur (3) :**
- OrganizerCtfs.jsx : Mes CTF créés
- CreateCtf.jsx : Créer un CTF
- EditCtf.jsx : Modifier un CTF

**Pages admin (9) :**
- AdminDashboard.jsx : Tableau de bord
- AdminCtfsManagement.jsx : Gestion des CTF
- AdminCtfValidation.jsx : Validation des CTF
- AdminTeams.jsx : Gestion des équipes
- AdminUsers.jsx : Gestion des utilisateurs
- AdminUserRequests.jsx : Validation des inscriptions
- AdminParticipants.jsx : Gestion des participants
- AdminOrganizers.jsx : Gestion des organisateurs
- AdminStats.jsx : Statistiques

**Pages partagées :**
- Messaging.jsx : Mes conversations
- Conversation.jsx : Une conversation

## Points forts

### Performance
- Vite offre un démarrage quasi-instantané et un Hot Module Replacement ultra-rapide
- Bundles optimisés en production avec tree-shaking
- Lazy loading facile à ajouter si besoin

### Expérience utilisateur
- Interface responsive (mobile, tablette, desktop)
- Mode sombre confortable pour les yeux
- Navigation intuitive avec menu adaptatif
- Feedback visuel cohérent (badges, dialogs, erreurs)

### Sécurité
- Authentification JWT comme le backend
- Contrôle d'accès granulaire par rôle
- Validation des formulaires côté client
- Gestion propre des erreurs sans fuite d'infos

### Accessibilité
- Composants Radix UI avec support ARIA natif
- Navigation au clavier
- Labels et descriptions pour lecteurs d'écran

### Maintenabilité
- Architecture modulaire par domaine métier
- Composants réutilisables avec design system
- Séparation claire des responsabilités
- Code organisé et facile à naviguer

## Cohérence avec le backend

Le frontend et le backend communiquent parfaitement :

- **Même système JWT** : Le token généré par le backend est décodé côté frontend
- **Mêmes rôles** : PARTICIPANT, ORGANISATEUR, ADMINISTRATEUR
- **Mêmes codes d'erreur** : Les ApiException du backend sont affichées côté frontend
- **Même logique de soft delete** : On affiche les statuts de candidature (EN_ATTENTE, ACCEPTE, REFUSE, QUITTE, EXCLU)
- **Mêmes permissions** : Les règles de contact (qui peut contacter qui) sont respectées

## Améliorations possibles

Si on voulait aller plus loin, on pourrait :

- **WebSockets** : Messagerie en temps réel sans refresh
- **Progressive Web App** : Support offline et installation sur mobile
- **Lazy loading** : Charger les pages à la demande pour réduire le bundle initial
- **Tests** : Ajouter Jest + React Testing Library
- **TypeScript** : Migrer pour avoir du type safety complet
- **Internationalisation** : Support multi-langues
- **Analytics** : Tracking des événements utilisateur
- **Optimisation images** : Compression et formats modernes (WebP)

Mais l'architecture actuelle permet déjà d'avoir une application solide et professionnelle.
