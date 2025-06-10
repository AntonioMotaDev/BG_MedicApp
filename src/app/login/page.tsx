"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LoginSchema, type LoginFormData } from '@/lib/schema';
import { authService } from '@/lib/authService';
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      
      if (result.success) {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de nuevo.",
      });
      router.push('/');
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: result.error || "Credenciales inválidas. Por favor, inténtelo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de inicio de sesión",
        description: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Función para crear administrador demo (solo para desarrollo)
  const createDemoAdmin = async () => {
    setIsCreatingAdmin(true);
    try {
      const result = await authService.createAdmin(
        'admin@medicapp.com',
        'admin123456',
        'Administrador del Sistema'
      );

      if (result.success) {
        toast({
          title: "Administrador creado",
          description: "El administrador demo ha sido creado exitosamente.",
        });
        
        // Auto-llenar el formulario con las credenciales de admin
        form.setValue('email', 'admin@medicapp.com');
        form.setValue('password', 'admin123456');
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear el administrador.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el administrador.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
            <Input
              type="email"
              placeholder="ejemplo@correo.com"
                        {...field}
                        value={field.value || ""}
            />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
            <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          value={field.value || ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
          </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ¿No tiene cuenta?
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear nueva cuenta
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={createDemoAdmin}
                disabled={isCreatingAdmin}
                className="w-full"
              >
                {isCreatingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCreatingAdmin ? "Creando..." : "Crear Admin Demo"}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="mb-2">Credenciales de ejemplo:</p>
            <div className="bg-muted p-3 rounded-md text-xs">
              <p><strong>Admin:</strong> admin@medicapp.com / admin123456</p>
              <p><strong>Usuario:</strong> Crear cuenta nueva</p>
            </div>
      </div>
        </CardContent>
      </Card>
    </div>
  );
}
