import { useEffect, useRef } from "react";

export default function TinyBlock({
    initialText = '', onTextChange, registerRef,
    suggestion, setSuggestion,
    onNewBlockRequest, onMergeBlockRequest,
    onNextBlockRequest, onPrevBlockRequest,
}) {
    const pRef = useRef(null);
    const debounceTimerRef = useRef(null);

    useEffect(() => {
        if (pRef.current) {
            pRef.current.innerText = initialText;
        }
        console.log(pRef.current)
        registerRef?.(pRef.current);
    }, []);

    const getCaretPosition = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return null;
    
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(pRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
    
        return preCaretRange.toString().length;
    };

    useEffect(() => {
        const editable = pRef.current;
        if (!editable) return;
        const handleKeyDown = (e) => {
            console.log('Key pressed:', e.key);
            //create a new block on enter
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent default enter behavior
                //get text in editabla after current caret position
                const caretPos = getCaretPosition();
                const fullText = editable.innerText;

                const textBeforeCursor = fullText.slice(0, caretPos);
                const textAfterCursor = fullText.slice(caretPos).trim();

                if (textAfterCursor !== "") {
                    editable.innerText = textBeforeCursor;
                }
                onNewBlockRequest?.(textAfterCursor);
            }

            //support nevigation with arrows to next block
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                //check if the caret is at the end of the text
                const selection = window.getSelection();
                if (selection && selection.anchorOffset === editable.innerText.length) {
                    e.preventDefault(); // Prevent default arrow behavior
                    onNextBlockRequest?.();
                }
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                //check if caret is at the beginning of the text
                const selection = window.getSelection();
                if (selection && selection.anchorOffset === 0) {
                    e.preventDefault(); // Prevent default arrow behavior
                    onPrevBlockRequest?.();
                }
            }

            //merge blocks on backspace (at top) or delete (at bottom)
            if ((e.key === 'Backspace' && getCaretPosition() === 0)) {
                e.preventDefault(); // Prevent default delete behavior
                onMergeBlockRequest?.("prev");
                console.log("Merge Prev Block")
            }
            if ((e.key === 'Delete' && getCaretPosition() === 0)) {
                e.preventDefault(); // Prevent default delete behavior
                onMergeBlockRequest?.("next");
                console.log("Merge Next Block")
            }
                
            //accept suggestion on tab
            if (e.key === 'Tab' && suggestion !== "") {
                e.preventDefault(); // Prevent default tab behavior
                const trimmedSuggestion = getTrimmedSuggestion(suggestion);
                editable.innerText = trimmedSuggestion;
                setSuggestion("");
                onTextChange?.(trimmedSuggestion);
            }
        };
        editable.addEventListener("keydown", handleKeyDown);

        return () => {
            editable.removeEventListener("keydown", handleKeyDown);
        };
    }, [suggestion, onNewBlockRequest, onTextChange, setSuggestion]);

    const handleContentChange = (e) => {
        let newText = e.currentTarget.innerText;

        // Remove unwanted trailing newlines (only if they weren't just typed)
        if (newText.endsWith('\n') || newText.endsWith('\n\n')) {
            const selection = window.getSelection();
            if (selection && selection.anchorOffset === newText.length) {
                // User's caret is at the end — likely just pressed enter
                // In that case, don't interfere
            } else {
                newText = newText.replace(/\n+$/, '');
                e.currentTarget.innerText = newText;
            }
        }

        // Debounce suggestion logic, unchanged
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            if (suggestion === "") onTextChange?.(newText);
        }, 500);
    }

    return (
        <p className="tiny-block mb-4">
            <span ref={pRef} 
                contentEditable
                suppressContentEditableWarning={true}
                className="min-h-[200px] outline-none whitespace-pre-wrap break-words"
                onInput={handleContentChange}>    
            </span>
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
        </p>
    )
}


  /*
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
  */