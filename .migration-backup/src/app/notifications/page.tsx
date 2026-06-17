import { Metadata } from 'next';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications | CJP Media',
  description: 'Your latest notifications.',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
