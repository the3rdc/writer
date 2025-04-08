import { useRef, useEffect } from 'react'

export default function Editor({ initialValue = '', onTitleChange, initialTitle = '' }) {
  const divRef = useRef(null)
  const titleRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerText = initialValue
    }
    if (titleRef.current) {
      titleRef.current.innerText = initialTitle
    }
  }, [initialValue, initialTitle])

  return (
    <div className="flex justify-center">
      <div className="font-[family-name:var(--font-geist-mono)] antialiased prose w-full max-w-prose">
        <h1
          ref={titleRef}
          className="text-2xl font-bold mb-4"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            const newTitle = e.currentTarget.innerText;
            console.log('Title blur:', newTitle);
            onTitleChange?.(newTitle);
          }}
        />
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
