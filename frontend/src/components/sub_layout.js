import { useState } from 'react'
import Sidebar from './sidebar'

export default function SubLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Optional top nav */}
        <header className="h-16 flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 dark:bg-slate-900 rounded-r-md cursor-pointer"
          >
            {isOpen ? <span>&laquo;</span> : <span>&raquo;</span>}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
