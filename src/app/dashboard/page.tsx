import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | CJP Media',
  description: 'Manage your profile and settings.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
