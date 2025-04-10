import { useRef, useEffect, useState } from 'react';
import TinyBlock from './tiny_block';

function split_text(text){
  //split text on newlines
  //treat any number of consecutive newlines as a single newline
  //and remove leading and trailing newlines
  //reutrn an array of objects a block id and block text
  const lines = text.split(/\n+/).filter(line => line.trim() !== '');
  const blocks = lines.map((line, index) => {
    return {
      id: index,
      text: line.trim(),
      ref: null
    };
  });
  return blocks;
}

function add_block(blocks, after_block_id, text){
  const newBlock = {
    id: blocks.length,
    text: text || ''
  };
  //ids may not be in order, find the right one
  const index = blocks.findIndex(block => block.id === after_block_id);
  if (index === -1) {
    console.error('Block not found:', after_block_id);
    return blocks;
  }
  //insert the new block after the found block
  const updatedBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
 
  return updatedBlocks;
}

function set_ref(blocks, block_id, ref){
  //set the ref of the block with the given id to the given ref
  const updatedBlocks = blocks.map(block => {
    if (block.id === block_id) {
      return {
        ...block,
        ref: ref
      };
    }
    return block;
  });
  return updatedBlocks;
}

export default function Editor({ initialValue = '', initialTitle = '',
   onContentChange, onTitleChange, suggestion, setSuggestion
}) {
  const titleRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const [blocks, setBlocks] = useState([]);


  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerText = initialTitle;
    }
    setBlocks(split_text(initialValue));
  }, [initialValue, initialTitle]);

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
      if (suggestion === "") onContentChange?.(newText);
    }, 500);
  };

  const handleTinycontentChange = (block_id, newText) => {
    console.log('TinyBlock content change:', block_id, newText);
  }
  
  const onRegiserRef = (block_id, ref) => {
    console.log("registering ref", block_id, ref);
    setBlocks((prevBlocks) => {
      const newBlocks = set_ref(prevBlocks, block_id, ref);
      return newBlocks;
    });
    //set cursor to beginnin of the ref
    if (ref) {
      console.log(ref);
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(ref);
      range.collapse(true); // Collapse to the start of the range
      selection.removeAllRanges(); // Clear any existing selections
      selection.addRange(range); // Set the new selection
    }
  }

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

  const handleNewBlockRequest = (after_block_id, newText) => {
    setBlocks((prevBlocks) => {
      const newBlocks = add_block(prevBlocks, after_block_id, newText);
      return newBlocks;
    });
  }

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
        {
          blocks.map((block, index) => (
            <TinyBlock
              key={block.id}
              initialText={block.text}
              onTextChange={(newText) => {handleTinycontentChange(block.id, newText)}}
              onNewBlockRequest={(text) => handleNewBlockRequest(block.id, text)}
              registerRef={(ref) => onRegiserRef(block.id, ref)}
              suggestion={suggestion}
              setSuggestion={setSuggestion} 
            />
          ))
        }
      </div>
    </div>
  );
}
