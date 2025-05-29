"use client";

import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Loader2, UserCog, ArrowLeftCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import type { Metadata } from 'next'; // Metadata not used directly in "use client"

// export const metadata: Metadata = { // Cannot be used in "use client" component
//   title: 'BG MedicApp - User Profile',
//   description: 'Manage your user profile.',
// };

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); 
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      const email = localStorage.getItem('userEmail');
      if (!authStatus) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        setUserEmail(email || '');
        setUserName(email?.split('@')[0] || 'User');
      }
      setIsAuthCheckComplete(true);
    }
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Implementar la lógica de actualización de perfil aquí
      toast({
        title: "Perfil actualizado",
        description: "Sus datos han sido actualizados correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar su perfil. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || !isAuthCheckComplete) {
    return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
        </footer>
      </div>
    );
  }

  if (!isAuthenticated) {
     return (
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <p>Redirecting to login...</p>
          <Loader2 className="ml-2 h-8 w-8 animate-spin text-primary" />
        </main>
        <footer className="text-center p-4 text-muted-foreground text-sm border-t">
          © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl">
            <div className="mb-6 flex justify-start">
                <Link href="/main-menu" passHref legacyBehavior>
                <Button variant="outline">
                    <ArrowLeftCircle className="mr-2 h-5 w-5" />
                    Back to Main Menu
                </Button>
                </Link>
            </div>
            <Card className="shadow-lg rounded-lg">
                <CardHeader className="text-center">
                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <UserCog className="h-8 w-8" />
                </div>
                <CardTitle className="text-2xl">Perfil</CardTitle>
                <CardDescription>Administre su información personal</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                            <AvatarFallback>JP</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                            Cambiar foto
                        </Button>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input 
                        id="name" 
                        type="text" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                        placeholder="Juan Pérez"
                        required
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        value={userEmail} 
                        disabled
                        className="cursor-not-allowed bg-muted/50"
                        required
                    />
                        <p className="text-xs text-muted-foreground">Email address cannot be changed here.</p>
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+34612345678"
                    />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                    </Button>
                </form>
                </CardContent>
            </Card>
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} BG MedicApp. All rights reserved. (For demo purposes only)
      </footer>
    </div>
  );
};

export default ProfilePage;
