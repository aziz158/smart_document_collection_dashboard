import { create } from 'zustand'
import type { UploadedDocument, ReminderState, DocCategory } from '../types'
import { categorizeDocument } from '../services/mockAI'

interface DocumentStore {
  documents: UploadedDocument[]
  addDocuments: (files: File[]) => void
  removeDocument: (id: string) => void
  updateDocumentCategory: (id: string, category: DocCategory) => void

  reminder: ReminderState
  setReminderEnabled: (enabled: boolean) => void
  setReminderInterval: (ms: number) => void
  snoozeReminders: (durationMs: number) => void
  recordReminderFired: (categories: DocCategory[]) => void
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],

  addDocuments: async (files: File[]) => {
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl))

    const newDocs: UploadedDocument[] = files.map((file, i) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type,
      fileSizeBytes: file.size,
      dataUrl: dataUrls[i],
      uploadedAt: Date.now(),
      categorizationStatus: 'pending',
      category: null,
      confidence: null,
    }))

    set((state) => ({ documents: [...state.documents, ...newDocs] }))

    // Flip all to 'processing' immediately so UI shows spinner
    set((state) => ({
      documents: state.documents.map((d) =>
        newDocs.some((n) => n.id === d.id) ? { ...d, categorizationStatus: 'processing' } : d,
      ),
    }))

    await Promise.allSettled(
      newDocs.map(async (doc) => {
        try {
          const result = await categorizeDocument(doc.fileName, doc.fileType, doc.dataUrl)
          set((state) => ({
            documents: state.documents.map((d) =>
              d.id === doc.id
                ? { ...d, category: result.category, confidence: result.confidence, categorizationStatus: 'done' }
                : d,
            ),
          }))
        } catch {
          set((state) => ({
            documents: state.documents.map((d) =>
              d.id === doc.id ? { ...d, categorizationStatus: 'failed' } : d,
            ),
          }))
        }
      }),
    )
  },

  removeDocument: (id: string) => {
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }))
  },

  updateDocumentCategory: (id: string, category: DocCategory) => {
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id
          ? { ...d, category, categorizationStatus: 'done', manuallySet: true }
          : d,
      ),
    }))
  },

  reminder: {
    remindersEnabled: true,
    reminderIntervalMs: 30_000,
    lastReminderFiredAt: null,
    snoozedUntil: null,
    activeReminderCategories: [],
  },

  setReminderEnabled: (enabled: boolean) => {
    set((state) => ({ reminder: { ...state.reminder, remindersEnabled: enabled } }))
  },

  setReminderInterval: (ms: number) => {
    set((state) => ({ reminder: { ...state.reminder, reminderIntervalMs: ms } }))
  },

  snoozeReminders: (durationMs: number) => {
    set((state) => ({
      reminder: { ...state.reminder, snoozedUntil: Date.now() + durationMs },
    }))
  },

  recordReminderFired: (categories: DocCategory[]) => {
    set((state) => ({
      reminder: {
        ...state.reminder,
        lastReminderFiredAt: Date.now(),
        activeReminderCategories: categories,
      },
    }))
  },
}))

// Stable selector — avoids inline arrow function re-renders
export const selectDocuments = (s: DocumentStore) => s.documents
export const selectReminder = (s: DocumentStore) => s.reminder
