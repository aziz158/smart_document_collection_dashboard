import type { ChecklistItem as ChecklistItemType } from '../types'

interface Props {
  item: ChecklistItemType
}

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(ts)
}

export default function ChecklistItem({ item }: Props) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      {item.isCollected ? (
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-amber-300 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${item.isCollected ? 'text-gray-800' : 'text-gray-500'}`}>
          {item.category}
        </p>
        {item.isCollected && item.collectedAt && (
          <p className="text-xs text-gray-400">{formatDate(item.collectedAt)}</p>
        )}
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
        item.isCollected
          ? 'text-green-700 bg-green-50'
          : 'text-amber-700 bg-amber-50'
      }`}>
        {item.isCollected ? 'Done' : 'Missing'}
      </span>
    </div>
  )
}
