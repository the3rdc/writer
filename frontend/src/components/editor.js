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
  if (blocks.length === 0) {
    blocks.push({
      id: 0,
      text: '',
      ref: null
    });
  }
  return blocks;
}

function blocks_to_text(blocks){
  const text = blocks.map(block => block.ref?.innerText).join('\n');
  return text;
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

function merge_blocks(blocks, block_id, direction){
  console.log("merging blocks", block_id, direction);
  //merge the block with the given id with the block in the given direction
  //direction can be 'prev' or 'next'
  //if a block is found in the indicated dirction, prepend or append the content and remove the original block
  const index = blocks.findIndex(block => block.id === block_id);
  if (index === -1) {
    console.error('Block not found:', block_id);
    return blocks;
  }
  const block = blocks[index];
  let updatedBlocks = [...blocks];
  if (direction === 'prev' && index > 0) {
    //merge with the previous block
    const prevBlock = blocks[index - 1];

    const target_cursor_pos = prevBlock.ref.innerText.length;

    const merged_content = prevBlock.ref.innerText + block.ref.innerText;
    prevBlock.ref.innerText = merged_content;

    prevBlock.ref.focus(); //focus on the previous block

    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(prevBlock.ref.childNodes[0], target_cursor_pos);
    range.collapse(true); // Collapse to the start of the range
    selection.removeAllRanges(); // Clear any existing selections
    selection.addRange(range); // Set the new selection

    updatedBlocks.splice(index, 1); //remove the current block
  } else if (direction === 'next' && index < blocks.length - 1) {
    //merge with the next block
    const nextBlock = blocks[index + 1];
   
    console.log("current block content", block.ref.innerText);
    console.log("next block content", nextBlock.ref.innerText);

    const target_cursor_pos = block.ref.innerText.length;

    const merged_content = block.ref.innerText + nextBlock.ref.innerText;
    block.ref.innerText = merged_content;

    block.ref.focus(); //focus on the current block

    const range = document.createRange();
    const selection = window.getSelection();
    range.setStart(block.ref.childNodes[0], target_cursor_pos);
    range.collapse(true); // Collapse to the start of the range
    selection.removeAllRanges(); // Clear any existing selections
    selection.addRange(range); // Set the new selection

    updatedBlocks.splice(index + 1, 1); //remove the next block

  } else {
    console.error('Invalid direction or no block to merge with:', direction);
    return blocks;
  }
  console.log("returning updated blocks", updatedBlocks);
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
   onRequestSave, onRequestSuggestions, onTitleChange, suggestion, setSuggestion
}) {
  const titleRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const [blocks, setBlocks] = useState([]);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

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
    const content = blocks_to_text(blocks);
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (suggestion === ""){
        onRequestSuggestions?.(content);
      }else{
        onRequestSave?.(content);
      }
    }, 500);
  }
  
  const onRegiserRef = (block_id, ref) => {
    console.log("registering ref", block_id, ref);
    setBlocks((prevBlocks) => {
      const newBlocks = set_ref(prevBlocks, block_id, ref);
      return newBlocks;
    });
    //set cursor to beginning of the ref
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

  const handleNewBlockRequest = (after_block_id, newText) => {
    setBlocks((prevBlocks) => {
      const newBlocks = add_block(prevBlocks, after_block_id, newText);
      return newBlocks;
    });
    if(suggestion === ""){
      handleTinycontentChange(blocks.length, "");
    }
  }

  const handlePrevBlockRequest = (block_id) => {
    const index = blocks.findIndex(block => block.id === block_id);
    if (index > 0) {
      const prevBlock = blocks[index - 1];
      if (prevBlock.ref) {
        prevBlock.ref.focus();
        // Create a range and set it to the end of the content
        const range = document.createRange();
        range.selectNodeContents(prevBlock.ref);
        range.collapse(false); // Collapse the range to the end

        // Apply the range to the current selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  const handleNextBlockRequest = (block_id) => {
    const index = blocks.findIndex(block => block.id === block_id);
    if (index < blocks.length - 1) {
      const nextBlock = blocks[index + 1];
      if (nextBlock.ref) {
        nextBlock.ref.focus();
      }
    }
  }

  const handleMergeBlockRequest = (block_id, direction) => {
    console.log("got merge request", block_id, direction);
    const newBlocks = merge_blocks(blocks, block_id, direction);
    setBlocks(newBlocks);
  }

  return (
    <div className="flex justify-center">
      <div className="font-[family-name:var(--font-geist-mono)] antialiased prose w-full max-w-prose">
        <div>
          <h1
            ref={titleRef}
            className="text-2xl font-bold mb-4"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleBlur}
          />
          <div className="mb-4">
                <button
                  onClick={() => {
                    const text = blocks_to_text(blocks);
                    navigator.clipboard.writeText(text).then(() => {
                      console.log('Copied!');
                    });
                  }}
                  className="text-sm text-blue-500 hover:underline"
                >
                  📋 Copy
                </button>
                <button
                  onClick={() => setPasteModalOpen(true)}
                  className="text-sm text-blue-500 hover:underline"
                >
                  📥 Paste
                </button>
          </div>
        </div>
        {
          blocks.map((block, index) => (
            <TinyBlock
              key={block.id}
              initialText={block.text}
              registerRef={(ref) => onRegiserRef(block.id, ref)}
              onTextChange={(newText) => {handleTinycontentChange(block.id, newText)}}
              onNewBlockRequest={(text) => handleNewBlockRequest(block.id, text)}
              onNextBlockRequest={() => handleNextBlockRequest(block.id)}
              onPrevBlockRequest={() => handlePrevBlockRequest(block.id)}
              onMergeBlockRequest={(direction) => handleMergeBlockRequest(block.id, direction)}
              suggestion={(index === blocks.length - 1) ? suggestion : ""}
              setSuggestion={setSuggestion} 
            />
          ))
        }
      </div>
      {pasteModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-2">Paste Text</h2>
            <textarea
              rows={10}
              className="w-full border border-gray-300 p-2 mb-4"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPasteModalOpen(false)} className="text-sm text-gray-500">Cancel</button>
              <button onClick={() => {
                const newBlocks = split_text(pastedText);
                setBlocks(newBlocks);
                setPasteModalOpen(false);
              }} className="text-sm text-blue-500 font-medium">Insert</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}