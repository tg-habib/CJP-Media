import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import ProfileClient from "../app/profile/ProfileClient";

export default function ProfilePage() {
  const [initialPosts, setInitialPosts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileSnap = await getDoc(doc(db, "settings", "profile"));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setProfile({
            ...data,
            updatedAt: data.updatedAt?.toDate?.()?.getTime?.() || data.updatedAt,
          });
        }
        const postsSnap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(6)));
        setInitialPosts(postsSnap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.getTime?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.getTime?.() || data.updatedAt,
          };
        }));
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return <ProfileClient initialPosts={initialPosts} profile={profile} />;
}
