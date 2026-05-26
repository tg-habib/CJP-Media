import { Metadata } from 'next';
import AdminClient from './AdminClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | CJP Media',
  description: 'Manage your platform settings and posts',
};

export default function AdminPage() {
  return <AdminClient />;
}