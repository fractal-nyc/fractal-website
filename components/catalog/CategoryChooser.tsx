import { GALLERY_CATEGORIES, type GalleryCategoryId } from "./registry";

export function CategoryChooser({ active, counts, onChange }: { active: GalleryCategoryId; counts: Record<GalleryCategoryId, number>; onChange: (id: GalleryCategoryId) => void }) {
  return <nav className="library-category-chooser" aria-label="Browse component types">
    {GALLERY_CATEGORIES.map((category) => <button key={category.id} type="button" aria-pressed={active === category.id} onClick={() => onChange(category.id)}>
      <span>{category.label}</span><span aria-label={`${counts[category.id]} components`}>{counts[category.id]}</span>
    </button>)}
  </nav>;
}
