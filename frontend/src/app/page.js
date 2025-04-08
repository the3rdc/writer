'use client'

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";
import Editor from "@/components/editor";
import { getItems, getItem, createItem } from "@/lib/api";
import toast from "react-hot-toast";

export default function Home() {
  
  const router = useRouter();
  const {user, session, loading } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const [isOpen, setIsOpen] = useState(true)

  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [activeDocId, setActiveDocId] = useState(null);
  const [activeTitle, setActiveTitle] = useState("");
  const [content, setContent] = useState("");

  const [loadingEditor, setLoadingEditor] = useState(false);

  
  const fetchDocs = async () => {
    try {
      setLoadingDocs(true);
      const items = await getItems(session.access_token, router, "document", true, false);
      setDocs(items);
    } catch (err) {
      toast.error('Failed to fetch documents');
      console.error('Failed to fetch docs:', err);
      if (!cancelled) setDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const openDoc = async (docId) => {
    try {
      setLoadingEditor(true);
      const doc = await getItem(docId, session.access_token, router, true, true);
      setActiveDocId(doc.item_id);
      setActiveTitle(doc.item_meta.title);
      setContent(doc.item_content);
    } catch (err) {
      toast.error('Failed to open document');
      console.error('Failed to open doc:', err);
    } finally {
      setLoadingEditor(false);
    }
  }
  
  const createDoc = async () => {
    try {
      setLoadingEditor(true);
      const newDoc = {
        title: "Blank Page",
        content: "Start writing anything...",
      };
      const createdDocs = await createItem(session.access_token, router,
        "document",
        { title: newDoc.title },
        newDoc.content
      );
      console.log('Created document:', createdDocs);
      await fetchDocs();
      await openDoc(createdDocs[0].item_id); // open it after creating
    } catch (err) {
      toast.error('Failed to create document');
      console.error('Failed to create doc:', err);
      setLoadingEditor(false); // in case openDoc never gets called
    }
  }  

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetchDocs();
  }, [session, router]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} >
        <button
          onClick={createDoc}
          className="p-2 my-3 mx-4 text-sm cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800 font-[family-name:var(--font-geist-sans)]"
        >+ New</button>
        <br />
        <hr className="border-gray-300 dark:border-gray-700" />
        <br />
        <ul className="space-y-2 text-sm">
          {
            !loadingDocs && docs.map((doc) => (
              <li key={doc.item_id}>
                <a
                  className="p-2 my-3 mx-4 text-gray-700 dark:text-gray-200 cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800"
                  onClick={() => {
                    openDoc(doc.item_id);
                  }}
                >
                  {doc.item_meta.title}
                </a>
              </li>
            ))
          }
        </ul>
        <br />
        <hr className="border-gray-300 dark:border-gray-700" />
        <br />
        <button
            className="p-2 my-3 mx-4 text-xs cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800"
        >Account</button>
        <div className={ isOpen ? 'hidden' : 'flex items-center justify-between p-4' }>
          <button
              className="p-2 my-3 mx-4 text-xs cursor-pointer rounded hover:bg-gray-200 dark:hover:bg-gray-800"
          >Account</button>
        </div>
      </Sidebar>

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
          {loadingEditor ? (
            <div className="text-center text-gray-500 mt-24 animate-pulse">
              Loading editor...
            </div>
          ) : activeDocId ? (
            <Editor
              key={activeDocId}
              initialTitle={activeTitle}
              initialValue={content}
            />
          ) : (
            <div className="text-center text-gray-500 mt-24">
              Select or create a document to begin
            </div>
          )}
        </main>

      </div>
    </div>
  )
}