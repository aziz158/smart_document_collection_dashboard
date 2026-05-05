import { useDocumentStore } from '../store/documentStore'

const INTERVAL_OPTIONS = [
  { label: '30 seconds', value: 30_000 },
  { label: '1 minute',   value: 60_000 },
  { label: '5 minutes',  value: 300_000 },
]

export default function ReminderSettings() {
  const reminder = useDocumentStore((s) => s.reminder)
  const setReminderEnabled = useDocumentStore((s) => s.setReminderEnabled)
  const setReminderInterval = useDocumentStore((s) => s.setReminderInterval)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 space-y-3">
      <h2 className="text-sm font-semibold text-gray-800">Reminder Settings</h2>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Follow-up reminders</span>
        <button
          role="switch"
          aria-checked={reminder.remindersEnabled}
          onClick={() => setReminderEnabled(!reminder.remindersEnabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            reminder.remindersEnabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            reminder.remindersEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
          }`} />
        </button>
      </div>

      {reminder.remindersEnabled && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600">Interval</span>
          <select
            value={reminder.reminderIntervalMs}
            onChange={(e) => setReminderInterval(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {reminder.lastReminderFiredAt && (
        <p className="text-xs text-gray-400">
          Last reminder: {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(reminder.lastReminderFiredAt)}
        </p>
      )}
    </div>
  )
}
