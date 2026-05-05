import { useDocumentStore } from '../store/documentStore'
import { REQUIRED_DOC_TYPES } from '../constants/documentTypes'
import type { ChecklistItem } from '../types'

export function useChecklistItems(): ChecklistItem[] {
  const documents = useDocumentStore((s) => s.documents)

  return REQUIRED_DOC_TYPES.map((category) => {
    const match = documents.find(
      (d) => d.category === category && d.categorizationStatus === 'done',
    )
    return {
      category,
      isCollected: !!match,
      collectedAt: match?.uploadedAt ?? null,
      documentId: match?.id ?? null,
    }
  })
}
