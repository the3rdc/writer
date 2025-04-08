import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, children }) {
  const router = useRouter();
  const { user, session, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [error, setError] = useState(null);

  return (
    <aside
      className={
        'h-full transition-[width] duration-300 dark:bg-slate-900 font-[family-name:var(--font-geist-sans)] antialiased '
        + (isOpen ? 'w-64' : 'w-0 overflow-hidden')
      }
    >
      <div className={ isOpen ? '' : 'hidden' }>
        {children}
      </div>
    </aside>
  )
}