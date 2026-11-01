import { Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthContext'

// Les pages placées à l'intérieur ne sont accessibles qu'une fois connecté
export default function RouteProtegee() {
  const { utilisateur } = useAuth()
  return utilisateur ? <Outlet /> : <Navigate to="/connexion" replace />
}
