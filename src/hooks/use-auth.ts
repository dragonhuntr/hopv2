import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { authClient } from '@/app/(auth)/auth';

export const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

interface UseAuthProps {
  onSuccess?: () => void;
}

export function useAuth({ onSuccess }: UseAuthProps = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleAuth = async (formData: FormData, action: 'login' | 'register') => {
    setIsLoading(true);
    try {
      const validatedData = authFormSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
      });

      let response;
      if (action === 'register') {
        response = await authClient.signUp.email({
          email: validatedData.email,
          password: validatedData.password,
          name: 'User',
        });
      } else {
        response = await authClient.signIn.email({
          email: validatedData.email,
          password: validatedData.password,
        });
      }

      if (response.error) {
        throw new Error(response.error.message);
      }

      setIsSuccessful(true);
      onSuccess?.();
      router.refresh();
      router.push('/chat');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Please check your input and try again.');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred.');
      }
      setIsSuccessful(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSuccessful,
    login: (formData: FormData) => handleAuth(formData, 'login'),
    register: (formData: FormData) => handleAuth(formData, 'register'),
  };
} 