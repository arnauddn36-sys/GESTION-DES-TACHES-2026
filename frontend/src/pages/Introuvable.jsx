import { Link } from 'react-router'
import { boutonPrincipal } from '../styles'

export default function Introuvable() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-slate-600">Cette adresse n'existe pas.</p>
      <Link to="/" className={boutonPrincipal + ' mt-6'}>
        Retour à l'accueil
      </Link>
    </div>
  )
}
