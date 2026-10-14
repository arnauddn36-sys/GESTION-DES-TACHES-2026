FROM node:24-slim AS dependances
# Part d'une image Linux légère (Debian "slim") qui contient déjà Node.js 24 ; on la nomme "dependances"

WORKDIR /app
# Se place dans le dossier /app à l'intérieur de l'image (il est créé s'il n'existe pas)

RUN npm install -g bun
# Installe Bun, ton gestionnaire de paquets (l'image node ne le contient pas)

COPY package.json bun.lock ./
# Copie SEULEMENT la liste des dépendances (pas le code) pour profiter du cache Docker, expliqué plus bas

RUN bun install --frozen-lockfile --production
# Installe les paquets exacts du bun.lock, sans les outils de développement (--production)


FROM node:24-slim AS construction
# Nouvelle image de départ, indépendante de la précédente ; on la nomme "construction"

WORKDIR /app
# Dossier de travail dans cette étape

RUN npm install -g bun
# Installe Bun ici aussi (chaque étape repart d'une image vide)

COPY package.json bun.lock ./
# Copie d'abord uniquement les fichiers de dépendances (même astuce de cache)

RUN bun install --frozen-lockfile
# Installe TOUT, y compris les outils de développement (nest, prisma, typescript) nécessaires à la compilation

COPY . .
# Copie maintenant le reste du code (le .dockerignore écarte node_modules, .env, etc.)

RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" bunx prisma generate --config prisma7.config.ts
# Génère le client Prisma dans src/generated ; cette fausse URL sert juste à satisfaire la config, aucune connexion n'est faite

RUN bun run build
# Lance "nest build" : compile le TypeScript de src/ vers le dossier dist/

FROM node:24-slim AS production
# Image de départ de l'image finale : Node seulement, sans Bun, sans outils de développement

ENV NODE_ENV=production
# Indique aux bibliothèques qu'on est en production (certaines s'optimisent grâce à ça)

WORKDIR /app
# Dossier de travail de l'image finale

COPY --chown=node:node package.json ./
# Copie le package.json (indispensable : il contient "type": "module" qui dit à Node d'utiliser les imports ESM)

COPY --chown=node:node --from=dependances /app/node_modules ./node_modules
# Récupère les paquets de production installés à l'étape 1

COPY --chown=node:node --from=construction /app/dist ./dist
# Récupère le code compilé de l'étape 2 (dist/), sans le code source ni les outils

USER node
# Lance l'application avec l'utilisateur "node" (sans droits root) : si quelqu'un exploite une faille, il a moins de pouvoir

EXPOSE 3001
# Documente que l'API écoute sur le port 3001 (c'est une indication, l'ouverture réelle se fait au lancement)

CMD ["node", "dist/main"]
# Commande lancée au démarrage du conteneur : exécute ton API compilée (comme ton script start:prod)