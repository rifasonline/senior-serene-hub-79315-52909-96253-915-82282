-- Criar enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Criar função de segurança has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies para user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Atualizar política de inserção de elderly_profiles para incluir admins
DROP POLICY IF EXISTS "Caregivers can insert elderly profiles" ON public.elderly_profiles;

CREATE POLICY "Caregivers and admins can insert elderly profiles"
ON public.elderly_profiles FOR INSERT
WITH CHECK (
  auth.uid() = caregiver_id 
  AND (
    public.has_active_subscription(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- Atualizar política de visualização de medical_history para admins
DROP POLICY IF EXISTS "Caregivers can view medical history of their elderly" ON public.medical_history;

CREATE POLICY "Caregivers and admins can view medical history"
ON public.medical_history FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR (
    EXISTS (
      SELECT 1 FROM public.elderly_profiles 
      WHERE id = medical_history.elderly_id 
        AND caregiver_id = auth.uid()
    )
    AND (
      public.get_user_plan(auth.uid()) = 'pro'
      OR medical_history.created_at >= now() - interval '30 days'
    )
  )
);

-- Atualizar políticas de SOS alerts para admins
DROP POLICY IF EXISTS "Pro users can view their SOS alerts" ON public.sos_alerts;

CREATE POLICY "Pro users and admins can view SOS alerts"
ON public.sos_alerts FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin')
  OR (
    public.get_user_plan(auth.uid()) = 'pro'
    AND EXISTS (
      SELECT 1 FROM public.elderly_profiles 
      WHERE id = sos_alerts.elderly_id 
        AND caregiver_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Pro users can create SOS alerts" ON public.sos_alerts;

CREATE POLICY "Pro users and admins can create SOS alerts"
ON public.sos_alerts FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR (
    public.get_user_plan(auth.uid()) = 'pro'
    AND auth.uid() = triggered_by
    AND EXISTS (
      SELECT 1 FROM public.elderly_profiles 
      WHERE id = sos_alerts.elderly_id 
        AND caregiver_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Pro users can update SOS alerts" ON public.sos_alerts;

CREATE POLICY "Pro users and admins can update SOS alerts"
ON public.sos_alerts FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin')
  OR (
    public.get_user_plan(auth.uid()) = 'pro'
    AND EXISTS (
      SELECT 1 FROM public.elderly_profiles 
      WHERE id = sos_alerts.elderly_id 
        AND caregiver_id = auth.uid()
    )
  )
);