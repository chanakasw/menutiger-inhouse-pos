import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginSchema, type Login } from '@swiftpos/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/store';
import { api } from '@/lib/api-client';
import type { AuthResponse } from '../auth.types';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useSessionStore();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/checkout';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Login>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: Login) => {
    try {
      const result = await api.post<AuthResponse>('/api/auth/login', data);
      setSession(result.user, result.tokens);
      navigate(from, { replace: true });
    } catch {
      setError('root', { message: 'Invalid credentials. Check your email, password, and store ID.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SwiftPOS</CardTitle>
          <CardDescription>Sign in to your store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="tenantSlug">Store ID</Label>
              <Input id="tenantSlug" placeholder="my-store" {...register('tenantSlug')} />
              {errors.tenantSlug && <p className="text-xs text-destructive">{errors.tenantSlug.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="cashier@store.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            {errors.root && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
