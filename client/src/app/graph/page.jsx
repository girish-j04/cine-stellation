'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import MovieRecommendationGraph from '../components/MovieRecommendationGraph';

export default function GraphPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;
  }

  return <MovieRecommendationGraph />;
}
