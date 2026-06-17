import { useParams } from "wouter";
import PostViewClient from "../app/post/[id]/PostViewClient";
import { useEffect, useState } from "react";

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    import("../firebase").then(({ db }) => {
      import("firebase/firestore").then(({ doc, getDoc }) => {
        getDoc(doc(db, "settings", "profile")).then((snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setProfile({ ...data, updatedAt: data.updatedAt?.toDate?.()?.getTime?.() || data.updatedAt });
          }
        }).catch(console.error);
      });
    });
  }, []);

  if (!id) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Invalid post</div>;

  return <PostViewClient id={id} initialPost={null} profile={profile} />;
}
