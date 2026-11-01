// Client d'API : tous les appels au serveur passent par ce fichier.
// En développement, Vite envoie /api/... vers l'API (voir vite.config.js).
// En production, on définira VITE_API_URL (adresse de l'API en ligne).
const BASE = import.meta.env.VITE_API_URL ?? '/api'

const CLE_TOKEN = 'token'
const CLE_UTILISATEUR = 'utilisateur'

// ---------- Session (gardée dans le navigateur) ----------
export const lireToken = () => localStorage.getItem(CLE_TOKEN)

export function lireUtilisateur() {
  try {
    return JSON.parse(localStorage.getItem(CLE_UTILISATEUR))
  } catch {
    return null
  }
}

export function sauverSession(token, utilisateur) {
  localStorage.setItem(CLE_TOKEN, token)
  localStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur))
}

export function effacerSession() {
  localStorage.removeItem(CLE_TOKEN)
  localStorage.removeItem(CLE_UTILISATEUR)
}

// ---------- Erreur renvoyée par l'API ----------
export class ErreurApi extends Error {
  constructor(message, statut) {
    super(message)
    this.statut = statut // code HTTP : 400, 401, 404, 409... (0 = serveur injoignable)
  }
}

// NestJS renvoie { statusCode, message, error } ; message est un texte ou une liste
function messageDepuis(donnees) {
  const message = donnees?.message
  if (Array.isArray(message)) return message.join(', ')
  return message ?? 'Une erreur est survenue, réessaie.'
}

// ---------- Fonction de base : tous les appels passent par ici ----------
async function appeler(chemin, { methode = 'GET', corps, publique = false } = {}) {
  const token = publique ? null : lireToken()

  let reponse
  try {
    reponse = await fetch(`${BASE}${chemin}`, {
      method: methode,
      headers: {
        ...(corps ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corps ? JSON.stringify(corps) : undefined,
    })
  } catch {
    throw new ErreurApi("Impossible de joindre le serveur. Vérifie que l'API est lancée.", 0)
  }

  if (reponse.status === 204) return null // suppression réussie : pas de contenu
  const donnees = await reponse.json().catch(() => null)

  if (!reponse.ok) {
    // Token expiré ou invalide : on efface la session et on prévient l'application
    if (reponse.status === 401 && token) {
      effacerSession()
      window.dispatchEvent(new Event('session-expiree'))
    }
    throw new ErreurApi(messageDepuis(donnees), reponse.status)
  }
  return donnees
}

// La liste peut arriver sous plusieurs formes : on la ramène toujours à la même
function normaliserListe(reponse, page, limite) {
  const items = Array.isArray(reponse)
    ? reponse
    : (reponse?.data ?? reponse?.items ?? reponse?.tasks ?? [])
  const meta = Array.isArray(reponse) ? null : (reponse?.meta ?? reponse)
  const total = meta?.total ?? meta?.totalItems ?? meta?.count ?? null
  const totalPages =
    meta?.totalPages ??
    meta?.lastPage ??
    (total === null ? null : Math.max(1, Math.ceil(total / limite)))
  const aSuite = totalPages === null ? items.length === limite : page < totalPages
  return { items, total, totalPages, page, aSuite }
}

// ---------- Les appels que les pages utilisent ----------
export const api = {
  inscription: (name, email, password) =>
    appeler('/auth/register', { methode: 'POST', corps: { name, email, password }, publique: true }),

  connexion: (email, password) =>
    appeler('/auth/login', { methode: 'POST', corps: { email, password }, publique: true }),

  async lister({ completed = '', priority = '', search = '', page = 1, limit = 8 } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (completed) params.set('completed', completed) // 'true' ou 'false'
    if (priority) params.set('priority', priority) // 'low', 'medium' ou 'high'
    if (search) params.set('search', search)
    return normaliserListe(await appeler(`/tasks?${params}`), page, limit)
  },

  creer: (donnees) => appeler('/tasks', { methode: 'POST', corps: donnees }),
  modifier: (id, donnees) => appeler(`/tasks/${id}`, { methode: 'PUT', corps: donnees }),
  terminer: (id) => appeler(`/tasks/${id}/complete`, { methode: 'PATCH' }),
  supprimer: (id) => appeler(`/tasks/${id}`, { methode: 'DELETE' }),
}
