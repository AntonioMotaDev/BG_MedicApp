"use client";

import type { FC } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema, type PatientFormData, type Patient } from "@/lib/schema";
import { addPatient, updatePatient } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// Removed Popover, Calendar, CalendarIcon imports
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface PatientFormProps {
  patient?: Patient; // For editing
  onClose: () => void;
}

const PatientForm: FC<PatientFormProps> = ({ patient, onClose }) => {
  const { toast } = useToast();
  const form = useForm<PatientFormData>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: patient
      ? {
          fullName: patient.fullName,
          dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
          gender: patient.gender,
          weightKg: patient.weightKg,
          heightCm: patient.heightCm,
          emergencyContact: patient.emergencyContact,
          medicalNotes: patient.medicalNotes || "",
        }
      : {
          fullName: "",
          dateOfBirth: undefined,
          gender: undefined,
          weightKg: undefined,
          heightCm: undefined,
          emergencyContact: "",
          medicalNotes: "",
        },
  });

  const onSubmit = async (data: PatientFormData) => {
    let result;
    if (patient && patient.id) {
      result = await updatePatient(patient.id, data);
    } else {
      result = await addPatient(data);
    }

    if (result.success) {
      toast({
        title: patient ? "Patient Updated" : "Patient Added",
        description: `Patient record ${patient ? 'updated' : 'created'} successfully.`,
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.error || `Failed to ${patient ? 'update' : 'add'} patient.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    field.onChange(e.target.value ? e.target.value : undefined);
                  }}
                  max={format(new Date(), 'yyyy-MM-dd')} // Prevent future dates
                  min="1900-01-01" // Optional: set a reasonable minimum past date
                  className={cn(!field.value && "text-muted-foreground")}
                />
              </FormControl>
              <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="weightKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="70" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="heightCm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="175" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact Phone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+12223334444" {...field} />
              </FormControl>
              <FormDescription>Include country code if applicable.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Relevant medical history, allergies, etc." rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (patient ? "Updating..." : "Adding...") : (patient ? "Update Patient" : "Add Patient")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PatientForm;