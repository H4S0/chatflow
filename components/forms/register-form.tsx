'use client';

import { useAuthActions } from '@convex-dev/auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Separator } from '../ui/separator';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthSchema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormValues = z.infer<typeof AuthSchema>;

export default function RegisterForm() {
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthActions();
  const router = useRouter();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(AuthSchema),
  });

  const onSubmit: SubmitHandler<AuthFormValues> = async (data) => {
    setIsLoading(true);

    setIsLoading(true);
    try {
      await signIn('password', {
        ...data,
        flow: flow,
      });
      toast.success(
        flow === 'signIn'
          ? 'Signed in successfully'
          : 'Account created successfully'
      );
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      if (
        error instanceof Error &&
        (error.message.includes('InvalidAccountId') ||
          error.message.includes('InvalidSecret'))
      ) {
        form.setError('root', {
          type: 'manual',
          message: 'Invalid credentials.',
        });
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md">
      <CardHeader>
        <CardTitle>{flow === 'signIn' ? 'Login' : 'Create account'}</CardTitle>
        <CardDescription>
          {flow === 'signIn'
            ? 'Enter your credentials to access your account.'
            : 'Enter your details to create a new account.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {flow === 'signUp' && (
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="user321" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {flow === 'signIn' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <Separator />
      <CardFooter className="flex items-center justify-center">
        <Button
          type="button"
          variant="link"
          className="text-sm"
          onClick={() => {
            setFlow(flow === 'signIn' ? 'signUp' : 'signIn');
            form.reset();
          }}
        >
          {flow === 'signIn'
            ? 'Need an account? Sign up'
            : 'Have an account? Sign in'}
        </Button>
      </CardFooter>
    </Card>
  );
}
