# API REST — Gestion de tâches avec authentification

API REST de gestion de tâches construite avec **NestJS** (TypeScript), **Prisma** et **PostgreSQL**. Chaque utilisateur s'inscrit, se connecte avec un **JWT** et ne peut voir ou modifier que **ses propres tâches**. Une collection **Bruno** documente et teste l'API.

## Fonctionnalités

- Création de compte et connexion (JWT)
- CRUD des tâches : créer, lister, consulter, modifier, marquer comme terminée, supprimer
- Filtrage des tâches par état (`completed`) et par priorité (`priority`)
- Isolation des données : un utilisateur n'accède jamais aux tâches d'un autre (réponse `404`)
- Validation des données d'entrée (DTO) et messages d'erreur clairs
- Mots de passe hashés avec sel, jamais stockés ni renvoyés en clair

## Technologies

- NestJS (TypeScript, modules ESM)
- Prisma 7.10.0 avec l'adaptateur `@prisma/adapter-pg`
- PostgreSQL (local ou hébergé, par exemple sur Supabase)
- JWT pour l'authentification
- bun comme gestionnaire de paquets
- Vitest pour les tests du projet
- Bruno pour la collection de requêtes et de tests d'API

## Prérequis

- **Node.js** (version LTS récente)
- **bun** : https://bun.sh
- **PostgreSQL 15 ou plus**, en local ou hébergé (par exemple un projet Supabase)
- **Bruno** (extension VS Code, application, ou CLI via `npx @usebruno/cli`)

## Installation

```bash
git clone <url-du-depot>
cd <dossier-du-projet>
bun install
```

## Configuration (`.env`)

Copie le fichier d'exemple, puis remplace les valeurs par les tiennes :

```bash
cp .env.example .env
```

| Variable       | Rôle                                                              |
| -------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL                                    |
| `JWT_SECRET`   | Secret servant à signer les JWT (longue chaîne aléatoire)         |

Pour générer un secret :

```bash
openssl rand -base64 32
```

> Le fichier `.env` contient des secrets : il ne doit **jamais** être poussé sur GitHub. Il est ignoré par Git ; seul `.env.example` est versionné.

## Base de données

Crée les tables, génère le client Prisma, puis charge les données d'essai :

```bash
bunx prisma generate
bunx prisma migrate deploy
bun run seed
```

Le seed crée 2 utilisateurs (`alice@example.com` et `bob@example.com`, mots de passe définis dans `prisma/seed.ts`) et 7 tâches de priorités et d'états variés (4 pour Alice, 3 pour Bob).

## Lancer l'API

```bash
# développement (rechargement automatique)
bun run start:dev

# production
bun run build
bun run start:prod
```

L'API écoute sur `http://localhost:3000`.

## Endpoints

### Authentification

| Méthode | Route            | Description                                         |
| ------- | ---------------- | --------------------------------------------------- |
| POST    | `/auth/register` | Crée un compte (`name`, `email`, `password`) → `201` |
| POST    | `/auth/login`    | Connexion (`email`, `password`) → `{ access_token }` |

### Tâches (toutes protégées par `Authorization: Bearer <token>`)

| Méthode | Route                  | Description                                            |
| ------- | ---------------------- | ------------------------------------------------------ |
| POST    | `/tasks`               | Crée une tâche pour l'utilisateur connecté → `201`     |
| GET     | `/tasks`               | Liste **ses** tâches (filtres ci-dessous)              |
| GET     | `/tasks/:id`           | Détail d'une tâche (`404` si inexistante ou d'un autre) |
| PUT     | `/tasks/:id`           | Modifie une tâche dont il est propriétaire             |
| PATCH   | `/tasks/:id/complete`  | Marque la tâche comme terminée                         |
| DELETE  | `/tasks/:id`           | Supprime la tâche → `204 No Content`                   |

Filtres sur `GET /tasks` : `?completed=true|false` et `?priority=low|medium|high`.

### Règles de validation

- `name`, `email` et `password` obligatoires à l'inscription ; email valide et unique (`409` s'il existe déjà)
- `title` obligatoire et non vide
- `priority` : `low`, `medium` ou `high`
- `completed` : booléen (`false` par défaut)

## Lancer les tests

Tests du projet :

```bash
bun run test
bun run test:e2e
```

## Utiliser Bruno

La collection **Tasks API** est dans le dossier `Tasks API/` (Auth et Tasks, avec assertions).

**Avec l'extension ou l'application Bruno :**

1. Ouvre le dossier `Tasks API` comme collection.
2. Sélectionne l'environnement `local` (variable `baseUrl` = `http://localhost:3000`).
3. Lance l'API et le seed, puis envoie les requêtes.

**En ligne de commande (recommandé, tout s'exécute d'un coup) :**

```bash
cd "Tasks API"
npx @usebruno/cli run --env local
```

Résultat attendu : 22 requêtes et 37 tests réussis. Les tests couvrent l'inscription, la connexion, l'accès protégé avec et sans token, le CRUD, le filtrage, les données invalides, et l'**isolation** : Bob ne peut ni consulter, ni modifier, ni supprimer une tâche d'Alice.

> Le Runner de l'extension VS Code peut boucler sans s'arrêter ; la CLI n'a pas ce défaut.

## Sécurité

- Mots de passe hashés avec sel, jamais renvoyés dans les réponses
- Routes des tâches protégées par JWT
- `userId` déterminé par le serveur à partir du token, jamais fourni par le client
- Secrets dans `.env`, non versionné