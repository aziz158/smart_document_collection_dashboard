import { useState } from 'react'
import { useDocumentStore } from '../store/documentStore'

export default function ReminderBanner() {
  const reminder = useDocumentStore((s) => s.reminder)
  const snoozeReminders = useDocumentStore((s) => s.snoozeReminders)
  const [dismissed, setDismissed] = useState(false)

  const isSnoozed = reminder.snoozedUntil !== null && Date.now() < reminder.snoozedUntil
  const hasActive = reminder.activeReminderCategories.length > 0

  if (!hasActive || isSnoozed || dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-800 truncate">
            <span className="font-semibold">{reminder.activeReminderCategories.length} document(s) still outstanding: </span>
            {reminder.activeReminderCategories.slice(0, 3).join(', ')}
            {reminder.activeReminderCategories.length > 3 && ` +${reminder.activeReminderCategories.length - 3} more`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => { snoozeReminders(5 * 60 * 1000) }}
            className="text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
          >
            Snooze 5 min
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="text-amber-400 hover:text-amber-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
