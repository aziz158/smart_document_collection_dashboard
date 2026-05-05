import { Toaster } from 'react-hot-toast'
import { useReminderEngine } from './hooks/useReminderEngine'
import Header from './components/Header'
import ReminderBanner from './components/ReminderBanner'
import UploadZone from './components/UploadZone'
import DocumentChecklist from './components/DocumentChecklist'
import DocumentGrid from './components/DocumentGrid'
import ReminderSettings from './components/ReminderSettings'

function ReminderEngineMount() {
  useReminderEngine()
  return null
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster
        position="bottom-right"
        toastOptions={{ style: { maxWidth: 340, padding: '12px 16px' } }}
      />
      <ReminderEngineMount />

      <Header />
      <ReminderBanner />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 lg:px-6">
        {/* Upload zone */}
        <section className="mb-6">
          <UploadZone />
        </section>

        {/* Two-column layout on desktop */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar: checklist + reminder settings */}
          <aside className="lg:w-72 flex-shrink-0 space-y-4">
            <DocumentChecklist />
            <ReminderSettings />
          </aside>

          {/* Right: document grid */}
          <section className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Documents</h2>
            <DocumentGrid />
          </section>
        </div>
      </main>
    </div>
  )
}
