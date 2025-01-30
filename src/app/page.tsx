import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }
  else {
    redirect('/chat');
  }
} 