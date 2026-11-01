import { Link, Outlet } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { boutonPrincipal, boutonSecondaire } from '../styles'

export default function Layout() {
  const { utilisateur, deconnexion } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-indigo-600">
            Gestion des tâches
          </Link>

          {utilisateur ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-600 sm:inline">{utilisateur.name}</span>
              <button onClick={deconnexion} className={boutonSecondaire}>
                Se déconnecter
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/connexion" className={boutonSecondaire}>
                Se connecter
              </Link>
              <Link to="/inscription" className={boutonPrincipal + ' !px-3 !py-1.5 text-sm'}>
                Créer un compte
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Ici s'affiche la page choisie par l'adresse */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
