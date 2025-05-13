
"use client";

import type { FC } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema, type PatientFormData, type Patient } from "@/lib/schema";
import { addPatient, updatePatient } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label"; // Unused
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
          fullName: patient.fullName || "", // Ensure "" if undefined/null
          dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : '',
          gender: patient.gender,
          weightKg: patient.weightKg, // react-hook-form handles undefined for numbers
          heightCm: patient.heightCm, // react-hook-form handles undefined for numbers
          emergencyContact: patient.emergencyContact || "", // Ensure "" if undefined/null
          medicalNotes: patient.medicalNotes || "", // Ensure "" if undefined/null
        }
      : {
          fullName: "",
          dateOfBirth: "",
          gender: undefined, // For Select, undefined is fine for placeholder
          weightKg: undefined,
          heightCm: undefined,
          emergencyContact: "",
          medicalNotes: "",
        },
  });

  const onSubmit = async (data: PatientFormData) => {
    let result;
    const dataToSend = {
      ...data,
      // Ensure dateOfBirth is a Date object when sending to server action.
      // The input is text YYYY-MM-DD, Zod coerces it to Date on validation for the form state.
      // If data.dateOfBirth is already a Date (from Zod coercion), this is fine.
      // If it's a string (shouldn't happen post-validation if Zod coerces properly), it's converted.
      dateOfBirth: new Date(data.dateOfBirth),
    };


    if (patient && patient.id) {
      result = await updatePatient(patient.id, dataToSend);
    } else {
      result = await addPatient(dataToSend);
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
                <Input placeholder="John Doe" {...field} value={field.value || ''} />
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
                  type="text"
                  placeholder="YYYY-MM-DD"
                  {...field}
                  value={field.value || ''} // Ensure value is a string
                />
              </FormControl>
              <FormDescription>
                Please use YYYY-MM-DD format.
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
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                  <Input type="number" placeholder="70" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ''} />
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
                  <Input type="number" placeholder="175" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} value={field.value ?? ''}/>
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
                <Input type="tel" placeholder="+12223334444" {...field} value={field.value || ''} />
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
                <Textarea placeholder="Relevant medical history, allergies, etc." rows={4} {...field} value={field.value || ''}/>
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
