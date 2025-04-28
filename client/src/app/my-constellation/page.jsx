'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MyConstellationGraph from '../components/MyConstellationGraph';

export default function MyConstellationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div style={{ color: 'white', padding: 40 }}>Loading...</div>;
  }

  if (!session?.user?.email) {
    return <div style={{ color: 'white', padding: 40 }}>You must be logged in.</div>;
  }

  return <MyConstellationGraph userEmail={session.user.email} />;
}
