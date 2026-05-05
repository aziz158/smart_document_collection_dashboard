import type { REQUIRED_DOC_TYPES } from '../constants/documentTypes'

export type DocCategory = typeof REQUIRED_DOC_TYPES[number] | 'Unknown'

export type CategorizationStatus = 'pending' | 'processing' | 'done' | 'failed'

export interface UploadedDocument {
  id: string
  fileName: string
  fileType: string
  fileSizeBytes: number
  dataUrl: string
  uploadedAt: number
  categorizationStatus: CategorizationStatus
  category: DocCategory | null
  confidence: number | null
}

export interface ChecklistItem {
  category: DocCategory
  isCollected: boolean
  collectedAt: number | null
  documentId: string | null
}

export interface ReminderState {
  remindersEnabled: boolean
  reminderIntervalMs: number
  lastReminderFiredAt: number | null
  snoozedUntil: number | null
  activeReminderCategories: DocCategory[]
}
