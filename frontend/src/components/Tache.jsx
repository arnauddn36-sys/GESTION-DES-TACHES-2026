import { useState } from 'react'
import { api } from '../api'
import { alerte, boutonDanger, boutonSecondaire } from '../styles'
import FormulaireTache from './FormulaireTache'

const PRIORITES = {
  low: { libelle: 'Basse', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { libelle: 'Moyenne', classes: 'bg-amber-50 text-amber-800 ring-amber-200' },
  high: { libelle: 'Haute', classes: 'bg-red-50 text-red-700 ring-red-200' },
}

// Une tâche de la liste : affichage, modification, validation et suppression
export default function Tache({ tache, onChange }) {
  const [edition, setEdition] = useState(false)
  const [occupe, setOccupe] = useState(false)
  const [erreur, setErreur] = useState(null)
  const priorite = PRIORITES[tache.priority] ?? PRIORITES.medium

  // Exécute une action, puis demande à la liste de se recharger
  async function agir(action) {
    setOccupe(true)
    setErreur(null)
    try {
      await action()
      onChange()
    } catch (e) {
      setErreur(e.message)
    } finally {
      setOccupe(false)
    }
  }

  function supprimer() {
    if (window.confirm(`Supprimer la tâche « ${tache.title} » ?`)) {
      agir(() => api.supprimer(tache.id))
    }
  }

  if (edition) {
    return (
      <li className="rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
        <FormulaireTache
          initial={tache}
          libelleBouton="Enregistrer"
          onValider={async (valeurs) => {
            await api.modifier(tache.id, valeurs)
            setEdition(false)
            onChange()
          }}
          onAnnuler={() => setEdition(false)}
        />
      </li>
    )
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3
          className={
            tache.completed
              ? 'font-semibold text-slate-400 line-through'
              : 'font-semibold text-slate-900'
          }
        >
          {tache.title}
        </h3>
        <div className="flex gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${priorite.classes}`}
          >
            {priorite.libelle}
          </span>
          {tache.completed && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200">
              Terminée
            </span>
          )}
        </div>
      </div>

      {tache.description && (
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{tache.description}</p>
      )}

      {erreur && (
        <p role="alert" className={alerte + ' mt-3'}>
          {erreur}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!tache.completed && (
          <button
            disabled={occupe}
            onClick={() => agir(() => api.terminer(tache.id))}
            className={boutonSecondaire}
          >
            Terminer
          </button>
        )}
        <button disabled={occupe} onClick={() => setEdition(true)} className={boutonSecondaire}>
          Modifier
        </button>
        <button disabled={occupe} onClick={supprimer} className={boutonDanger}>
          Supprimer
        </button>
      </div>
    </li>
  )
}
