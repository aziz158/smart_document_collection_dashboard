import clsx from 'clsx'
import { useDocumentStore } from '../store/documentStore'
import { CATEGORY_COLORS, REQUIRED_DOC_TYPES } from '../constants/documentTypes'
import type { DocCategory, UploadedDocument } from '../types'

const ALL_CATEGORIES: DocCategory[] = [...REQUIRED_DOC_TYPES, 'Unknown']

interface Props {
  doc: UploadedDocument
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function SkeletonBar({ width }: { width: string }) {
  return <div className={`h-2 rounded bg-gray-200 animate-pulse ${width}`} />
}

export default function DocumentCard({ doc }: Props) {
  const removeDocument = useDocumentStore((s) => s.removeDocument)
  const updateDocumentCategory = useDocumentStore((s) => s.updateDocumentCategory)
  const isProcessing = doc.categorizationStatus === 'processing' || doc.categorizationStatus === 'pending'
  const isFailed = doc.categorizationStatus === 'failed'
  const colors = doc.category ? CATEGORY_COLORS[doc.category] : CATEGORY_COLORS['Unknown']
  const showCategorySelector = doc.categorizationStatus === 'done' || isFailed

  const isImage = doc.fileType.startsWith('image/')
  const confidence = doc.confidence ?? 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Preview */}
      <div className="h-36 bg-gray-100 flex items-center justify-center relative overflow-hidden">
        {isImage ? (
          <img src={doc.dataUrl} alt={doc.fileName} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <button
          onClick={() => removeDocument(doc.id)}
          aria-label="Remove document"
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <p className="text-xs font-medium text-gray-800 truncate" title={doc.fileName}>
          {doc.fileName}
        </p>
        <p className="text-xs text-gray-400">{formatBytes(doc.fileSizeBytes)}</p>

        {isProcessing && (
          <div className="space-y-1.5 pt-1">
            <SkeletonBar width="w-3/4" />
            <SkeletonBar width="w-1/2" />
          </div>
        )}

        {isFailed && !doc.category && (
          <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Could not auto-detect
          </span>
        )}

        {doc.categorizationStatus === 'done' && doc.category && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={clsx(
              'inline-block text-xs font-medium rounded-full px-2 py-0.5 border',
              colors.bg, colors.text, colors.border,
            )}>
              {doc.category}
            </span>
            {doc.manuallySet && (
              <span className="text-xs text-gray-400 italic">edited</span>
            )}
          </div>
        )}

        {/* Confidence bar — only shown when AI set the category */}
        {doc.categorizationStatus === 'done' && doc.category && !doc.manuallySet && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  confidence >= 0.7 ? 'bg-green-400' : 'bg-amber-400',
                )}
                style={{ width: `${confidence * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Category selector — visible after processing or on failure */}
        {showCategorySelector && (
          <div className="pt-0.5">
            <label className="text-xs text-gray-400 mb-1 block">Change type</label>
            <select
              value={doc.category ?? 'Unknown'}
              onChange={(e) => updateDocumentCategory(doc.id, e.target.value as DocCategory)}
              className="w-full text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 cursor-pointer"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
