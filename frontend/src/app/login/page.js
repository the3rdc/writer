'use client'

import { useEffect, useState } from "react";
import { signInWithEmail, signInAnonymously } from "@/lib/supabase"


export default function Home() {
  
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [intro, setIntro] = useState(true)
  const [introd, setIntrod] = useState(true)
  const [introo, setIntroo] = useState(true)
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        event.preventDefault();
        setAccepted(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }
  , []);

  useEffect(() => {
    setTimeout(() => {
      setIntrod(false);
      setTimeout(() => {
        setIntroo(false);
        setTimeout(() => {
          setIntro(false);
        }
        , 1000);
      }
      , 200);
    }
    , 100);
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await signInWithEmail(email)
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the login link! (powered by Supabase)')
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <ul className="list-inside list-none text-lg text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Write like <strong>YOU</strong>.
          </li>
          <li className="tracking-[-.01em]">
            Autocomplete that <span className={(introd ? "opacity-0" : "opacity-100")}>d</span><span className={(introo ? "opacity-0" : "opacity-100")}>o</span>
            {
              accepted
                ? <span>esn't cramp your style.</span>
                : 
                  <span className={"relative group text-stone-600 dark:text-stone-400 " + (intro ? " opacity-0" : " opacity-100") + " transition-all duration-250"}>
                    esn't cramp your style.
                    <span className="absolute -bottom-5 left-0 text-xs text-stone-400 dark:text-stone-500">
                    &rsaquo; Tab to accept
                    </span>
                  </span>
            }
          </li>
        </ul>

        <form
          onSubmit={handleEmailLogin}
          className="flex items-stretch gap-0 w-full max-w-lg"
        >

          
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="flex-1 px-4 py-2.5 rounded-l-md border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none
              disabled:opacity-50
              dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 w-[100px] cursor-pointer bg-slate-700 text-white dark:text-stone-300 rounded-r-md transition focus:outline-none focus:ring-2 focus:ring-[#a8b5ff] disabled:opacity-50"
          >
            {loading ? '...' : 'Try It'}
          </button>
        </form>

        {message && (
          <div className="mt-2 text-center text-sm">
            {message}
          </div>
        )}

      </main>
      <footer className="row-start-3 text-stone-600 dark:text-stone-400">
        Please review the {" "}
        <a
          className="underline underline-offset-4"
          href="/legal"
          target="_blank"
          rel="noopener noreferrer"
        >
          privacy policy and terms of service
        </a>
        {" "} before using the app.
      </footer>
    </div>
  );
}
