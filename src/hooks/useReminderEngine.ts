import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useDocumentStore } from '../store/documentStore'
import { REQUIRED_DOC_TYPES } from '../constants/documentTypes'
import type { DocCategory } from '../types'
import ReminderToastContent from '../components/ReminderToastContent'
import { createElement } from 'react'

export function useReminderEngine() {
  const documents = useDocumentStore((s) => s.documents)
  const reminder = useDocumentStore((s) => s.reminder)
  const recordReminderFired = useDocumentStore((s) => s.recordReminderFired)
  const snoozeReminders = useDocumentStore((s) => s.snoozeReminders)

  useEffect(() => {
    if (!reminder.remindersEnabled) return

    const interval = setInterval(() => {
      const now = Date.now()
      if (reminder.snoozedUntil && now < reminder.snoozedUntil) return

      const collectedCategories = new Set<DocCategory>(
        documents
          .filter((d) => d.category && d.categorizationStatus === 'done')
          .map((d) => d.category as DocCategory),
      )

      const missing = REQUIRED_DOC_TYPES.filter((c) => !collectedCategories.has(c))
      if (missing.length === 0) return

      toast(
        (t) =>
          createElement(ReminderToastContent, {
            missing,
            onSnooze: () => {
              snoozeReminders(5 * 60 * 1000)
              toast.dismiss(t.id)
            },
            onDismiss: () => toast.dismiss(t.id),
          }),
        { id: 'reminder', duration: 8000 },
      )

      recordReminderFired([...missing])
    }, reminder.reminderIntervalMs)

    return () => clearInterval(interval)
  }, [
    reminder.remindersEnabled,
    reminder.reminderIntervalMs,
    reminder.snoozedUntil,
    documents,
    recordReminderFired,
    snoozeReminders,
  ])
}
