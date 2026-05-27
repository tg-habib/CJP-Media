import { Metadata } from 'next';
import MessagesClient from './MessagesClient';

export const metadata: Metadata = {
  title: 'Messages | CJP Media',
  description: 'Your direct messages.',
};

export default function MessagesPage() {
  return <MessagesClient />;
}
