import { boutonSecondaire } from '../styles'

// Boutons Précédent / Suivant sous la liste
export default function Pagination({ page, totalPages, aSuite, onChange }) {
  if (page === 1 && !aSuite) return null // une seule page : rien à afficher

  return (
    <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className={boutonSecondaire}>
        Précédent
      </button>
      <span className="text-sm text-slate-600">
        Page {page}
        {totalPages ? ` sur ${totalPages}` : ''}
      </span>
      <button disabled={!aSuite} onClick={() => onChange(page + 1)} className={boutonSecondaire}>
        Suivant
      </button>
    </nav>
  )
}
