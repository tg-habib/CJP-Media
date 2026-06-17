import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import AdminPostClient from '../app/admin/post/[id]/AdminPostClient';
import { getAdminPost } from '../app/admin/post/[id]/actions';

export default function AdminPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    getAdminPost(params.id).then((data) => {
      setPost(data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        Post not found.
      </div>
    );
  }

  return <AdminPostClient initialPost={post} />;
}
