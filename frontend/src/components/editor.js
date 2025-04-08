import { useRef, useEffect } from 'react';

export default function Editor({ initialValue = '', onContentChange, onTitleChange, initialTitle = '' }) {
  const divRef = useRef(null);
  const titleRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerText = initialValue;
    }
    if (titleRef.current) {
      titleRef.current.innerText = initialTitle;
    }
  }, [initialValue, initialTitle]);

  const handleContentChange = (e) => {
    const newText = e.currentTarget.innerText;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      onContentChange?.(newText);
    }, 500); // debounce delay
  };

  const handleTitleBlur = (e) => {
    const newTitle = e.currentTarget.innerText;
    console.log('Title blur:', newTitle);
    onTitleChange?.(newTitle);
  };

  return (
    <div className="flex justify-center">
      <div className="font-[family-name:var(--font-geist-mono)] antialiased prose w-full max-w-prose">
        <h1
          ref={titleRef}
          className="text-2xl font-bold mb-4"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleTitleBlur}
        />
        <div
          ref={divRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          className="min-h-[200px] outline-none whitespace-pre-wrap break-words"
        />
      </div>
    </div>
  );
}
