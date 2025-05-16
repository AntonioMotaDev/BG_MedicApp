
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

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
          fullName: patient.fullName || "", 
          // Ensure dateOfBirth is a Date object for the form's default value if editing
          dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : undefined,
          gender: patient.gender,
          weightKg: patient.weightKg ?? undefined, 
          heightCm: patient.heightCm ?? undefined,
          emergencyContact: patient.emergencyContact || "", 
          medicalNotes: patient.medicalNotes || "", 
        }
      : {
          fullName: "",
          dateOfBirth: undefined, // Use undefined for Popover default
          gender: undefined, 
          weightKg: undefined,
          heightCm: undefined,
          emergencyContact: "",
          medicalNotes: "",
        },
  });

  const onSubmit = async (data: PatientFormData) => {
    let result;
    // The 'data' object here is already of type PatientFormData,
    // meaning data.dateOfBirth is already a Date object due to Zod coercion.
    // It can be passed directly to the server actions.

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
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
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
