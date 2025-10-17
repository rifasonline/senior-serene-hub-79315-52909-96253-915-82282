-- Add phone and cpf columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN cpf TEXT UNIQUE;

-- Add constraint to ensure CPF format
ALTER TABLE public.profiles
ADD CONSTRAINT cpf_format CHECK (cpf ~ '^[0-9]{11}$');