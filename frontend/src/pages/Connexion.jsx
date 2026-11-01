import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { alerte, boutonPrincipal, carte, champ, etiquette } from '../styles'

export default function Connexion() {
  const { utilisateur, connexion } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  // Déjà connecté : retour à la liste des tâches
  if (utilisateur) return <Navigate to="/" replace />

  async function soumettre(e) {
    e.preventDefault()
    if (!email.trim() || !motDePasse) {
      setErreur('Renseigne ton email et ton mot de passe.')
      return
    }
    setErreur(null)
    setEnvoi(true)
    try {
      await connexion(email.trim(), motDePasse)
      navigate('/', { replace: true })
    } catch (err) {
      setErreur(err.statut === 401 ? 'Email ou mot de passe incorrect.' : err.message)
      setEnvoi(false)
    }
  }

  return (
    <div className={carte + ' mx-auto max-w-md'}>
      <h1 className="text-2xl font-bold">Connexion</h1>
      <p className="mt-1 text-sm text-slate-600">Retrouve tes tâches.</p>

      <form onSubmit={soumettre} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className={etiquette}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={champ}
          />
        </div>
        <div>
          <label htmlFor="mot-de-passe" className={etiquette}>
            Mot de passe
          </label>
          <input
            id="mot-de-passe"
            type="password"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className={champ}
          />
        </div>

        {erreur && (
          <p role="alert" className={alerte}>
            {erreur}
          </p>
        )}

        <button type="submit" disabled={envoi} className={boutonPrincipal + ' w-full'}>
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="font-semibold text-indigo-600 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
