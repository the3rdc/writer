'use client'

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubLayout from "@/components/sub_layout";
import Editor from "@/components/editor";
import { getItems } from "@/lib/api";

export default function Home() {
  
  const router = useRouter();
  const {user, session, loading } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [content, setContent] = useState("Start writing...")

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <SubLayout>
      <Editor
        initialValue={content}
        onChange={(val) => console.log('Changed:', val)}
      />
    </SubLayout>
  );
}
