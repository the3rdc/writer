import { useRef, useEffect } from 'react';

export default function Editor({ initialValue = '', initialTitle = '',
   onContentChange, onTitleChange, suggestion, setSuggestion
}) {
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
      if(suggestion === ""){
        onContentChange?.(newText);
      }
    }, 500); // debounce delay
  };

  const handleTitleBlur = (e) => {
    const newTitle = e.currentTarget.innerText;
    console.log('Title blur:', newTitle);
    onTitleChange?.(newTitle);
  };

  const getTrimmedSuggestion = (full) => {
    if (!full) return '';
    const match = full.match(/.*?[.?!,:;…]/);
    return match ? match[0] : full;
  };  

  useEffect(() => {
    const editable = divRef.current;
    if (!editable) return;
  
    const handleKeyDown = (event) => {
      console.log('Key pressed:', event.key);
      if (event.key === "Tab" && suggestion !== "") {
        event.preventDefault();
        const trimmed = getTrimmedSuggestion(suggestion);
  
        // Insert the suggestion at the caret position
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
  
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(trimmed));
        range.collapse(false);
  
        setSuggestion((prev) => prev.replace(trimmed, ""));
      }else if (suggestion !== "" && event.key === suggestion[0]) {
        //remove the first character from the suggestion
        setSuggestion((prev) => prev.substring(1));
      }else{
        setSuggestion("");
      }
    };
  
    editable.addEventListener("keydown", handleKeyDown);
  
    return () => editable.removeEventListener("keydown", handleKeyDown);
  }, [suggestion]);

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
        <div>
          <span
            ref={divRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            className="min-h-[200px] outline-none whitespace-pre-wrap break-words"
          />
          {
            suggestion != "" && (
              <span className="text-stone-600 dark:text-stone-400">
                {getTrimmedSuggestion(suggestion)}
                <span className="ml-2 text-xs text-stone-400 dark:text-stone-500">
                &rsaquo; Tab to accept
                </span>
              </span>            
            )
          }
        </div>
      </div>
    </div>
  );
}
