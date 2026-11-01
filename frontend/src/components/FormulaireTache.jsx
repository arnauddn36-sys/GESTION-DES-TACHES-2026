import { useState } from 'react'
import { alerte, boutonPrincipal, boutonSecondaire, champ, etiquette } from '../styles'

const PRIORITES = [
  { valeur: 'low', libelle: 'Basse' },
  { valeur: 'medium', libelle: 'Moyenne' },
  { valeur: 'high', libelle: 'Haute' },
]

// Formulaire partagé : création d'une tâche (sans "initial") et modification (avec "initial")
export default function FormulaireTache({ initial, libelleBouton, onValider, onAnnuler }) {
  const [titre, setTitre] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priorite, setPriorite] = useState(initial?.priority ?? 'medium')
  const [erreur, setErreur] = useState(null)
  const [envoi, setEnvoi] = useState(false)

  async function soumettre(e) {
    e.preventDefault()
    if (!titre.trim()) {
      setErreur('Le titre est obligatoire.')
      return
    }
    setErreur(null)
    setEnvoi(true)
    try {
      await onValider({
        title: titre.trim(),
        description: description.trim(),
        priority: priorite,
      })
      if (!initial) {
        // Création réussie : on vide le formulaire
        setTitre('')
        setDescription('')
        setPriorite('medium')
      }
    } catch (err) {
      setErreur(err.message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <form onSubmit={soumettre} noValidate className="space-y-4">
      <div>
        <label htmlFor="titre" className={etiquette}>
          Titre
        </label>
        <input
          id="titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          placeholder="Ex. : Préparer la présentation"
          className={champ}
        />
      </div>

      <div>
        <label htmlFor="description" className={etiquette}>
          Description (facultative)
        </label>
        <textarea
          id="description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={champ}
        />
      </div>

      <div>
        <label htmlFor="priorite" className={etiquette}>
          Priorité
        </label>
        <select
          id="priorite"
          value={priorite}
          onChange={(e) => setPriorite(e.target.value)}
          className={champ}
        >
          {PRIORITES.map((p) => (
            <option key={p.valeur} value={p.valeur}>
              {p.libelle}
            </option>
          ))}
        </select>
      </div>

      {erreur && (
        <p role="alert" className={alerte}>
          {erreur}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={envoi} className={boutonPrincipal}>
          {envoi ? 'Un instant…' : libelleBouton}
        </button>
        {onAnnuler && (
          <button type="button" onClick={onAnnuler} className={boutonSecondaire + ' !py-2'}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
