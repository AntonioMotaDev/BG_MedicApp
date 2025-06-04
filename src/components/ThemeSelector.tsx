'use client';

import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      name: 'Claro',
      value: 'light' as const,
      icon: Sun,
      description: 'Tema claro siempre activo'
    },
    {
      name: 'Oscuro',
      value: 'dark' as const,
      icon: Moon,
      description: 'Tema oscuro siempre activo'
    },
    {
      name: 'Automático',
      value: 'system' as const,
      icon: Monitor,
      description: 'Sigue la configuración de tu dispositivo'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tema</CardTitle>
        <CardDescription>
          Selecciona tu tema preferido para la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon;
            const isSelected = theme === themeOption.value;
            
            return (
              <Button
                key={themeOption.value}
                variant={isSelected ? "default" : "outline"}
                className={`justify-start h-auto p-4 ${
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted"
                }`}
                onClick={() => setTheme(themeOption.value)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{themeOption.name}</div>
                    <div className={`text-sm ${
                      isSelected 
                        ? "text-primary-foreground/80" 
                        : "text-muted-foreground"
                    }`}>
                      {themeOption.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 