"use client";

import { FC, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema, type PatientFormData } from "@/lib/schema";
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
import { useToast } from "@/hooks/use-toast";
import { usePatients } from "@/hooks/usePatients";
import type { Patient } from "@/lib/schema";

interface PatientFormProps {
  onSubmitSuccess: () => void;
  onCancel: () => void;
  initialData?: Patient | null;
}

const PatientForm: FC<PatientFormProps> = ({ onSubmitSuccess, onCancel, initialData }) => {
  const { toast } = useToast();
  const { createPatient, updatePatient: updatePatientOffline, isOnline } = usePatients();
  
  const form = useForm<PatientFormData>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: initialData ? {
      paternalLastName: initialData.paternalLastName || "",
      maternalLastName: initialData.maternalLastName || "",
      firstName: initialData.firstName || "",
      age: initialData.age,
      sex: initialData.sex || "Sin definir",
      street: initialData.street || "",
      exteriorNumber: initialData.exteriorNumber || "",
      interiorNumber: initialData.interiorNumber || "",
      neighborhood: initialData.neighborhood || "",
      city: initialData.city || "",
      phone: initialData.phone || "",
      insurance: initialData.insurance || "",
      responsiblePerson: initialData.responsiblePerson || "",
      emergencyContact: initialData.emergencyContact || "",
    } : {
      paternalLastName: "",
      maternalLastName: "",
      firstName: "",
      age: undefined,
      sex: "Sin definir",
      street: "",
      exteriorNumber: "",
      interiorNumber: "",
      neighborhood: "",
      city: "",
      phone: "",
      insurance: "",
      responsiblePerson: "",
      emergencyContact: "",
    },
  });

 useEffect(() => {
    if (initialData) {
      form.reset({
        paternalLastName: initialData.paternalLastName || "",
        maternalLastName: initialData.maternalLastName || "",
        firstName: initialData.firstName || "",
        age: initialData.age,
        sex: initialData.sex || "Sin definir",
        street: initialData.street || "",
        exteriorNumber: initialData.exteriorNumber || "",
        interiorNumber: initialData.interiorNumber || "",
        neighborhood: initialData.neighborhood || "",
        city: initialData.city || "",
        phone: initialData.phone || "",
        insurance: initialData.insurance || "",
        responsiblePerson: initialData.responsiblePerson || "",
        emergencyContact: initialData.emergencyContact || "",
      });
    } else {
       form.reset({
        paternalLastName: "",
        maternalLastName: "",
        firstName: "",
        age: undefined,
        sex: "Sin definir",
        street: "",
        exteriorNumber: "",
        interiorNumber: "",
        neighborhood: "",
        city: "",
        phone: "",
        insurance: "",
        responsiblePerson: "",
        emergencyContact: "",
      });
    }
  }, [initialData, form]);


  const handleSubmit = async (data: PatientFormData) => {
    try {
      let result;
      if (initialData?.id) {
        result = await updatePatientOffline(initialData.id, data);
      } else {
        result = await createPatient(data);
      }

      if (result.success) {
        toast({
          title: "Éxito",
          description: initialData?.id 
            ? (isOnline ? "Paciente actualizado exitosamente" : "Cambios guardados localmente - se sincronizarán cuando haya conexión")
            : (isOnline ? "Paciente agregado exitosamente" : "Paciente guardado localmente - se sincronizará cuando haya conexión"),
        });
        onSubmitSuccess();
      } else {
        toast({
          title: "Error",
          description: result.error || "Ocurrió un error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar el paciente",
        variant: "destructive",
      });
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="paternalLastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido Paterno</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido paterno" {...field} value={field.value || ""} />
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
                <FormLabel>Apellido Materno</FormLabel>
                <FormControl>
                  <Input placeholder="Apellido materno" {...field} value={field.value || ""} />
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
                <FormLabel>Nombre(s)</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre(s)" {...field} value={field.value || ""} />
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
                <FormLabel>Edad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Edad"
                    value={field.value !== undefined ? field.value.toString() : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? undefined : Number(value));
                    }}
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
                <FormLabel>Sexo</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Sin definir">Sin definir</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Dirección:</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Calle</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle" {...field} value={field.value || ""} />
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
                  <FormLabel className="text-xs">Número Exterior</FormLabel>
                  <FormControl>
                    <Input placeholder="Número exterior" {...field} value={field.value || ""} />
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
                  <FormLabel className="text-xs">Colonia</FormLabel>
                  <FormControl>
                    <Input placeholder="Colonia" {...field} value={field.value || ""} />
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
                  <FormLabel className="text-xs">Número Interior (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Número interior" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-xs">Ciudad/Municipio</FormLabel>
                  <FormControl>
                    <Input placeholder="Ciudad o municipio" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 4441234567" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="insurance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seguro / Derechohabiencia (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="IMSS, ISSSTE, GNP, etc." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="responsiblePerson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona Responsable</FormLabel>
              <FormControl>
                <Input placeholder="Padre, Madre, Tutor, etc." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contacto de Emergencia (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Contacto de emergencia" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (initialData?.id ? "Actualizando..." : "Guardando...") : (initialData?.id ? "Actualizar Paciente" : "Guardar Paciente")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;

    