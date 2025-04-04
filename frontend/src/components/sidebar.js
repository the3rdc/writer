export default function Sidebar({ isOpen }) {
  return (
    <aside
      className={
        'h-full transition-[width] duration-300 dark:bg-slate-900 font-[family-name:var(--font-geist-sans)] antialiased ' +
        + (isOpen ? 'w-64' : 'w-0 overflow-hidden')
      }
    >
      {/* Only render content if open */}
      {isOpen && (<>
        <button
            className="p-2 my-3 mx-4 text-sm cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800 font-[family-name:var(--font-geist-sans)]"
        >+ New</button>
        <br />
        <hr className="border-gray-300 dark:border-gray-700" />
        <br />
        <ul className="space-y-2 text-sm">
          <li><a className="p-2 my-3 mx-4 text-gray-700 dark:text-gray-200 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800">Doc</a></li>
          <li><a className="p-2 my-3 mx-4 text-gray-700 dark:text-gray-200 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800">Doc</a></li>
          <li><a className="p-2 my-3 mx-4 text-gray-700 dark:text-gray-200 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800">Doc</a></li>
        </ul>
        <br />
        <hr className="border-gray-300 dark:border-gray-700" />
        <br />
        <button
            className="p-2 my-3 mx-4 text-xs cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800"
        >Account</button>
    </>)}
    </aside>
  )
}