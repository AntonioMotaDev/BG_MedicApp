"use client";

import { FC } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema, PatientFormData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

interface PatientFormProps {
  onSubmit: (data: z.infer<typeof PatientFormSchema>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<z.infer<typeof PatientFormSchema>>;
}

const PatientForm: FC<PatientFormProps> = ({ onSubmit, onClose, initialData }) => {
  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: initialData || {
      paternalLastName: "",
      maternalLastName: "",
      firstName: "",
      age: 0,
      sex: "Sin definir",
      street: "",
      exteriorNumber: "",
      interiorNumber: "",
      neighborhood: "",
      city: "",
      phone: "",
      insurance: "",
      responsiblePerson: "",
    },
  });

  const handleSubmit = async (data: PatientFormData) => {
    try {
      await onSubmit(data);
      toast.success("Paciente guardado exitosamente");
      onClose();
    } catch (error) {
      toast.error("Error al guardar el paciente");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="paternalLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Paterno:</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido paterno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maternalLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Materno:</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido materno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre(s):</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre(s)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
              name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Edad:</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Edad" 
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo:</FormLabel>
                <FormControl>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Masculino"
                        checked={field.value === "Masculino"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="hidden"
                      />
                      <span className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        field.value === "Masculino" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary hover:bg-secondary/80"
                      }`}>
                        Masculino
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Femenino"
                        checked={field.value === "Femenino"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="hidden"
                      />
                      <span className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        field.value === "Femenino" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary hover:bg-secondary/80"
                      }`}>
                        Femenino
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="Sin definir"
                        checked={field.value === "Sin definir"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="hidden"
                      />
                      <span className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        field.value === "Sin definir" 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary hover:bg-secondary/80"
                      }`}>
                        Sin definir
                      </span>
                    </label>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calle:</FormLabel>
                <FormControl>
                  <Input placeholder="Calle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="exteriorNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Exterior:</FormLabel>
                <FormControl>
                  <Input placeholder="Número exterior" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interiorNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número Interior:</FormLabel>
                <FormControl>
                  <Input placeholder="Número interior (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colonia:</FormLabel>
                <FormControl>
                  <Input placeholder="Colonia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ciudad:</FormLabel>
                <FormControl>
                  <Input placeholder="Municipio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono:</FormLabel>
                <FormControl>
                  <Input placeholder="444 444 4444" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="insurance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Derechohabiencia:</FormLabel>
                <FormControl>
                  <Input placeholder="IMSS, ISSSTE, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="responsiblePerson"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Persona Responsable:</FormLabel>
                <FormControl>
                  <Input placeholder="Padre, Madre, Tutor, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;
