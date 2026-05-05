import type { DocCategory } from '../types'

interface Props {
  missing: DocCategory[]
  onSnooze: () => void
  onDismiss: () => void
}

export default function ReminderToastContent({ missing, onSnooze, onDismiss }: Props) {
  return (
    <div className="flex flex-col gap-2 max-w-xs">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-gray-800">Documents still missing</p>
          <ul className="mt-1 space-y-0.5">
            {missing.slice(0, 4).map((cat) => (
              <li key={cat} className="text-xs text-gray-600">• {cat}</li>
            ))}
            {missing.length > 4 && (
              <li className="text-xs text-gray-400">+{missing.length - 4} more</li>
            )}
          </ul>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onSnooze}
          className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Snooze 5 min
        </button>
        <button
          onClick={onDismiss}
          className="text-xs px-2.5 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
