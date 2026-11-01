import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, effacerSession, lireToken, lireUtilisateur, sauverSession } from '../api'

const Contexte = createContext(null)

// Le token contient sa date d'expiration : on la lit pour savoir s'il est périmé
function tokenValide(token) {
  try {
    const milieu = token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')
    const { exp } = JSON.parse(atob(milieu))
    return typeof exp !== 'number' || exp * 1000 > Date.now()
  } catch {
    return false
  }
}

// Au démarrage du site : retrouve la personne connectée si son token est encore valable
function lireSession() {
  const token = lireToken()
  if (!token || !tokenValide(token)) {
    effacerSession()
    return null
  }
  return lireUtilisateur()
}

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(lireSession)

  // Quand l'API répond 401 (token expiré), api.js prévient ici : on déconnecte
  useEffect(() => {
    const surExpiration = () => setUtilisateur(null)
    window.addEventListener('session-expiree', surExpiration)
    return () => window.removeEventListener('session-expiree', surExpiration)
  }, [])

  const connexion = useCallback(async (email, password) => {
    const { access_token: token, user } = await api.connexion(email, password)
    sauverSession(token, user)
    setUtilisateur(user)
  }, [])

  // Après l'inscription, on connecte directement la personne
  const inscription = useCallback(
    async (name, email, password) => {
      await api.inscription(name, email, password)
      await connexion(email, password)
    },
    [connexion],
  )

  const deconnexion = useCallback(() => {
    effacerSession()
    setUtilisateur(null)
  }, [])

  const valeur = useMemo(
    () => ({ utilisateur, connexion, inscription, deconnexion }),
    [utilisateur, connexion, inscription, deconnexion],
  )

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

// Les pages utilisent : const { utilisateur } = useAuth()
export function useAuth() {
  const contexte = useContext(Contexte)
  if (!contexte) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return contexte
}
