"use client";

import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, User, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DashboardPage: FC = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: "Pacientes",
      description: "Administre los registros de pacientes",
      icon: Users,
      href: "/",
    },
    {
      title: "Reportes",
      description: "Genere y descargue reportes del sistema",
      icon: FileText,
      href: "/reports",
    },
    {
      title: "Citas",
      description: "Programe y gestione citas médicas",
      icon: Calendar,
      href: "/appointments",
    },
    {
      title: "Perfil",
      description: "Administre su información personal",
      icon: User,
      href: "/profile",
    },
    {
      title: "Configuración",
      description: "Configure las preferencias del sistema",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Bienvenido a BG MedicApp</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(item.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <item.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage; 