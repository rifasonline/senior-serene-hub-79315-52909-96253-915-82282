-- Fix 1: Add DELETE policy to subscriptions table to prevent users from deleting subscriptions
CREATE POLICY "Users cannot delete subscriptions"
ON public.subscriptions FOR DELETE
USING (false);

-- Fix 2: Add server-side input validation constraints

-- Profiles table constraints
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_full_name_length CHECK (full_name IS NULL OR length(full_name) <= 200),
  ADD CONSTRAINT profiles_phone_format CHECK (phone IS NULL OR phone ~ '^[0-9]{10,15}$'),
  ADD CONSTRAINT profiles_cpf_format CHECK (cpf IS NULL OR cpf ~ '^[0-9]{11}$');

-- Elderly profiles table constraints
ALTER TABLE public.elderly_profiles
  ADD CONSTRAINT elderly_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT elderly_emergency_name_length CHECK (emergency_contact_name IS NULL OR length(emergency_contact_name) <= 200),
  ADD CONSTRAINT elderly_emergency_phone_format CHECK (emergency_contact_phone IS NULL OR emergency_contact_phone ~ '^[0-9]{10,15}$'),
  ADD CONSTRAINT elderly_medical_conditions_limit CHECK (array_length(medical_conditions, 1) IS NULL OR array_length(medical_conditions, 1) <= 50),
  ADD CONSTRAINT elderly_allergies_limit CHECK (array_length(allergies, 1) IS NULL OR array_length(allergies, 1) <= 50);

-- Appointments table constraints
ALTER TABLE public.appointments
  ADD CONSTRAINT appointments_title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT appointments_description_length CHECK (description IS NULL OR length(description) <= 2000),
  ADD CONSTRAINT appointments_doctor_name_length CHECK (doctor_name IS NULL OR length(doctor_name) <= 200),
  ADD CONSTRAINT appointments_location_length CHECK (location IS NULL OR length(location) <= 300);

-- Daily tasks table constraints
ALTER TABLE public.daily_tasks
  ADD CONSTRAINT daily_tasks_description_length CHECK (length(description) <= 500),
  ADD CONSTRAINT daily_tasks_notes_length CHECK (notes IS NULL OR length(notes) <= 2000);

-- Medical history table constraints
ALTER TABLE public.medical_history
  ADD CONSTRAINT medical_history_title_length CHECK (length(title) <= 200),
  ADD CONSTRAINT medical_history_description_length CHECK (length(description) <= 2000),
  ADD CONSTRAINT medical_history_doctor_name_length CHECK (doctor_name IS NULL OR length(doctor_name) <= 200),
  ADD CONSTRAINT medical_history_location_length CHECK (location IS NULL OR length(location) <= 300),
  ADD CONSTRAINT medical_history_attachments_limit CHECK (array_length(attachments, 1) IS NULL OR array_length(attachments, 1) <= 20);

-- Medications table constraints
ALTER TABLE public.medications
  ADD CONSTRAINT medications_name_length CHECK (length(name) <= 200),
  ADD CONSTRAINT medications_dosage_length CHECK (length(dosage) <= 100),
  ADD CONSTRAINT medications_frequency_length CHECK (length(frequency) <= 100),
  ADD CONSTRAINT medications_notes_length CHECK (notes IS NULL OR length(notes) <= 1000),
  ADD CONSTRAINT medications_times_limit CHECK (array_length(times, 1) IS NULL OR array_length(times, 1) <= 24);

-- SOS alerts table constraints
ALTER TABLE public.sos_alerts
  ADD CONSTRAINT sos_alerts_location_length CHECK (location IS NULL OR length(location) <= 500),
  ADD CONSTRAINT sos_alerts_notes_length CHECK (notes IS NULL OR length(notes) <= 2000);