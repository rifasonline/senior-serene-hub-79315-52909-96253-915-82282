-- Create enums for the app
CREATE TYPE public.plan_type AS ENUM ('basic', 'pro');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'expired');
CREATE TYPE public.task_type AS ENUM ('medication', 'feeding', 'hygiene', 'exercise', 'other');
CREATE TYPE public.medical_entry_type AS ENUM ('exam', 'consultation', 'hospital', 'emergency', 'other');
CREATE TYPE public.sos_status AS ENUM ('pending', 'acknowledged', 'resolved');

-- Table: subscriptions (User subscription control)
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Table: elderly_profiles (Elderly profiles managed by caregivers)
CREATE TABLE public.elderly_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  photo_url TEXT,
  medical_conditions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: medications (Medication schedules)
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  times TIME[] NOT NULL DEFAULT '{}',
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: appointments (Medical appointments and commitments)
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  doctor_name TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: daily_tasks (Daily care tasks)
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  task_type task_type NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: medical_history (Medical history entries)
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  entry_type medical_entry_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  doctor_name TEXT,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  attachments TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: sos_alerts (Emergency alerts - Pro plan only)
CREATE TABLE public.sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  triggered_by UUID NOT NULL REFERENCES public.profiles(id),
  status sos_status NOT NULL DEFAULT 'pending',
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elderly_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user's subscription plan
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id UUID)
RETURNS plan_type
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT plan_type 
  FROM public.subscriptions 
  WHERE user_id = _user_id 
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;
$$;

-- Security definer function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = _user_id 
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for elderly_profiles
CREATE POLICY "Caregivers can view their elderly profiles"
ON public.elderly_profiles FOR SELECT
USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can insert elderly profiles"
ON public.elderly_profiles FOR INSERT
WITH CHECK (
  auth.uid() = caregiver_id 
  AND public.has_active_subscription(auth.uid())
);

CREATE POLICY "Caregivers can update their elderly profiles"
ON public.elderly_profiles FOR UPDATE
USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can delete their elderly profiles"
ON public.elderly_profiles FOR DELETE
USING (auth.uid() = caregiver_id);

-- RLS Policies for medications (access through elderly_profiles)
CREATE POLICY "Caregivers can view medications of their elderly"
ON public.medications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medications.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can insert medications"
ON public.medications FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medications.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update medications"
ON public.medications FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medications.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can delete medications"
ON public.medications FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medications.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

-- RLS Policies for appointments
CREATE POLICY "Caregivers can view appointments of their elderly"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = appointments.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can insert appointments"
ON public.appointments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = appointments.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update appointments"
ON public.appointments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = appointments.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can delete appointments"
ON public.appointments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = appointments.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

-- RLS Policies for daily_tasks
CREATE POLICY "Caregivers can view tasks of their elderly"
ON public.daily_tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = daily_tasks.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can insert tasks"
ON public.daily_tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = daily_tasks.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update tasks"
ON public.daily_tasks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = daily_tasks.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can delete tasks"
ON public.daily_tasks FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = daily_tasks.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

-- RLS Policies for medical_history (with plan restriction for basic users)
CREATE POLICY "Caregivers can view medical history of their elderly"
ON public.medical_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medical_history.elderly_id 
      AND caregiver_id = auth.uid()
  )
  AND (
    public.get_user_plan(auth.uid()) = 'pro'
    OR medical_history.created_at >= now() - interval '30 days'
  )
);

CREATE POLICY "Caregivers can insert medical history"
ON public.medical_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medical_history.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can update medical history"
ON public.medical_history FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medical_history.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Caregivers can delete medical history"
ON public.medical_history FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = medical_history.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

-- RLS Policies for sos_alerts (Pro plan only)
CREATE POLICY "Pro users can view their SOS alerts"
ON public.sos_alerts FOR SELECT
USING (
  public.get_user_plan(auth.uid()) = 'pro'
  AND EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = sos_alerts.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Pro users can create SOS alerts"
ON public.sos_alerts FOR INSERT
WITH CHECK (
  public.get_user_plan(auth.uid()) = 'pro'
  AND auth.uid() = triggered_by
  AND EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = sos_alerts.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

CREATE POLICY "Pro users can update SOS alerts"
ON public.sos_alerts FOR UPDATE
USING (
  public.get_user_plan(auth.uid()) = 'pro'
  AND EXISTS (
    SELECT 1 FROM public.elderly_profiles 
    WHERE id = sos_alerts.elderly_id 
      AND caregiver_id = auth.uid()
  )
);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_elderly_profiles_updated_at
BEFORE UPDATE ON public.elderly_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();