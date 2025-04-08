import { useRef, useEffect } from 'react'

export default function Editor({ initialValue = '', onChange, title }) {
  const divRef = useRef(null)

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerText = initialValue
    }
  }, [initialValue])

  return (
    <div className="flex justify-center">
      <div className="font-[family-name:var(--font-geist-mono)] antialiased prose w-full max-w-prose">
        <h1 className="text-2xl font-bold mb-4" contentEditable suppressContentEditableWarning>{title}</h1>
        <div
          ref={divRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange?.(e.currentTarget.innerText)}
          className="min-h-[200px] outline-none whitespace-pre-wrap break-words"
        />
      </div>
    </div>
  )
}
