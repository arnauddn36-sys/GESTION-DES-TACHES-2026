import { useEffect, useState } from 'react'
import { api } from '../api'
import FormulaireTache from '../components/FormulaireTache'
import Pagination from '../components/Pagination'
import Tache from '../components/Tache'
import { alerte, carte, champ } from '../styles'

const PAR_PAGE = 8

export default function Taches() {
  const [recherche, setRecherche] = useState('') // ce qui est tapé
  const [termeRecherche, setTermeRecherche] = useState('') // ce qui est envoyé à l'API
  const [statut, setStatut] = useState('') // '' (toutes), 'false' (à faire), 'true' (terminées)
  const [priorite, setPriorite] = useState('') // '', 'low', 'medium', 'high'
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0) // augmente pour recharger la liste
  const [resultat, setResultat] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  // On attend une courte pause dans la frappe avant de lancer la recherche
  useEffect(() => {
    const minuteur = setTimeout(() => {
      setTermeRecherche(recherche.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(minuteur)
  }, [recherche])

  // Chargement de la liste à chaque changement de filtre, de page ou de version
  useEffect(() => {
    let annule = false
    setChargement(true)
    api
      .lister({
        completed: statut,
        priority: priorite,
        search: termeRecherche,
        page,
        limit: PAR_PAGE,
      })
      .then((r) => {
        if (annule) return
        setResultat(r)
        setErreur(null)
      })
      .catch((e) => {
        if (!annule) setErreur(e.message)
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [statut, priorite, termeRecherche, page, version])

  // Dernière page devenue vide (après une suppression) : on recule d'une page
  useEffect(() => {
    if (resultat && resultat.page === page && resultat.items.length === 0 && page > 1) {
      setPage(page - 1)
    }
  }, [resultat, page])

  const recharger = () => setVersion((v) => v + 1)

  async function creer({ title, description, priority }) {
    await api.creer({ title, priority, ...(description ? { description } : {}) })
    setPage(1)
    recharger()
  }

  function changerFiltre(setter) {
    return (e) => {
      setter(e.target.value)
      setPage(1)
    }
  }

  const filtresActifs = Boolean(termeRecherche || statut || priorite)

  return (
    <div className="space-y-8">
      <section className={carte}>
        <h2 className="mb-4 text-lg font-semibold">Nouvelle tâche</h2>
        <FormulaireTache libelleBouton="Ajouter la tâche" onValider={creer} />
      </section>

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Mes tâches</h2>
          {resultat?.total != null && (
            <span className="text-sm text-slate-500">
              {resultat.total} tâche{resultat.total > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une tâche…"
            aria-label="Rechercher une tâche"
            className={champ}
          />
          <select
            value={statut}
            onChange={changerFiltre(setStatut)}
            aria-label="Filtrer par statut"
            className={champ}
          >
            <option value="">Toutes</option>
            <option value="false">À faire</option>
            <option value="true">Terminées</option>
          </select>
          <select
            value={priorite}
            onChange={changerFiltre(setPriorite)}
            aria-label="Filtrer par priorité"
            className={champ}
          >
            <option value="">Toutes priorités</option>
            <option value="high">Haute</option>
            <option value="medium">Moyenne</option>
            <option value="low">Basse</option>
          </select>
        </div>

        {erreur && (
          <p role="alert" className={alerte}>
            {erreur}
          </p>
        )}

        {!erreur && chargement && !resultat && <p className="text-slate-500">Chargement…</p>}

        {!erreur && resultat && resultat.items.length === 0 && !chargement && (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            {filtresActifs
              ? 'Aucune tâche ne correspond à ces critères.'
              : "Tu n'as pas encore de tâche. Crée la première ci-dessus."}
          </p>
        )}

        {resultat && resultat.items.length > 0 && (
          <ul
            className={
              chargement ? 'space-y-3 opacity-60 transition-opacity' : 'space-y-3 transition-opacity'
            }
          >
            {resultat.items.map((t) => (
              <Tache key={t.id} tache={t} onChange={recharger} />
            ))}
          </ul>
        )}

        {resultat && (
          <Pagination
            page={page}
            totalPages={resultat.totalPages}
            aSuite={resultat.aSuite}
            onChange={setPage}
          />
        )}
      </section>
    </div>
  )
}
