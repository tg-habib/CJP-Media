import { getAdminPost } from './actions';
import AdminPostClient from './AdminPostClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminPostDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getAdminPost(id);

  if (!post) {
    return notFound();
  }

  return <AdminPostClient initialPost={post} />;
}
