import { useChecklistItems } from '../hooks/useChecklistItems'
import ChecklistItem from './ChecklistItem'

export default function DocumentChecklist() {
  const items = useChecklistItems()
  const collected = items.filter((i) => i.isCollected).length
  const total = items.length

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Required Documents</h2>
        <span className="text-xs text-gray-500">
          <span className="font-semibold text-indigo-600">{collected}</span>/{total} collected
        </span>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(collected / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 pb-2">
        {items.map((item) => (
          <ChecklistItem key={item.category} item={item} />
        ))}
      </div>
    </div>
  )
}
