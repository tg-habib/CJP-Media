import { useParams } from 'wouter';
import UserProfileClient from '../app/user/[uid]/UserProfileClient';

export default function UserProfilePage() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid;

  if (!uid) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50">
        User not found.
      </div>
    );
  }

  return <UserProfileClient uid={uid} />;
}
