import { Route, Routes } from 'react-router'
import RouteProtegee from './auth/RouteProtegee'
import Layout from './components/Layout'
import Connexion from './pages/Connexion'
import Inscription from './pages/Inscription'
import Introuvable from './pages/Introuvable'
import Taches from './pages/Taches'

export default function App() {
  return (
    <Routes>
      {/* Layout entoure toutes les pages : menu en haut, page en dessous */}
      <Route element={<Layout />}>
        {/* Pages réservées aux personnes connectées */}
        <Route element={<RouteProtegee />}>
          <Route index element={<Taches />} />
        </Route>
        <Route path="connexion" element={<Connexion />} />
        <Route path="inscription" element={<Inscription />} />
        <Route path="*" element={<Introuvable />} />
      </Route>
    </Routes>
  )
}
