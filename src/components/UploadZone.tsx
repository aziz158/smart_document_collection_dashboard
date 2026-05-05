import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { useDocumentStore } from '../store/documentStore'

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp,.doc,.docx'

export default function UploadZone() {
  const addDocuments = useDocumentStore((s) => s.addDocuments)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    addDocuments(Array.from(files))
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${dragging
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        onChange={onChange}
        className="sr-only"
      />
      <svg
        className={`mx-auto w-10 h-10 mb-3 ${dragging ? 'text-indigo-500' : 'text-gray-400'}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <p className="text-sm font-medium text-gray-700">
        {dragging ? 'Drop files here' : 'Drag & drop files here'}
      </p>
      <p className="text-xs text-gray-400 mt-1">or click to browse — PDF, PNG, JPG, DOC supported</p>
    </div>
  )
}
