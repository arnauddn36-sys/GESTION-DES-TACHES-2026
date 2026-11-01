import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { alerte, boutonPrincipal, carte, champ, etiquette } from '../styles'

// Mêmes règles que l'API : nom de 2 caractères minimum, mot de passe de 8 minimum
function verifier(nom, email, motDePasse) {
  if (nom.trim().length < 2) return 'Le nom doit faire au moins 2 caractères.'
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "L'adresse email n'est pas valide."
  if (motDePasse.length < 8) return 'Le mot de passe doit faire au moins 8 caractères.'
  return null
}

export default function Inscription() {
  const { utilisateur, inscription } = useAuth()
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  if (utilisateur) return <Navigate to="/" replace />

  async function soumettre(e) {
    e.preventDefault()
    const probleme = verifier(nom, email, motDePasse)
    if (probleme) {
      setErreur(probleme)
      return
    }
    setErreur(null)
    setEnvoi(true)
    try {
      await inscription(nom.trim(), email.trim(), motDePasse)
      navigate('/', { replace: true })
    } catch (err) {
      setErreur(err.statut === 409 ? 'Cet email est déjà utilisé.' : err.message)
      setEnvoi(false)
    }
  }

  return (
    <div className={carte + ' mx-auto max-w-md'}>
      <h1 className="text-2xl font-bold">Créer un compte</h1>
      <p className="mt-1 text-sm text-slate-600">Quelques secondes suffisent.</p>

      <form onSubmit={soumettre} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="nom" className={etiquette}>
            Nom
          </label>
          <input
            id="nom"
            autoComplete="name"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={champ}
          />
        </div>
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
            autoComplete="new-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className={champ}
          />
          <p className="mt-1 text-sm text-slate-500">8 caractères minimum.</p>
        </div>

        {erreur && (
          <p role="alert" className={alerte}>
            {erreur}
          </p>
        )}

        <button type="submit" disabled={envoi} className={boutonPrincipal + ' w-full'}>
          {envoi ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="font-semibold text-indigo-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
