-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = user_uuid AND role = 'super_admin'
  );
$$;

-- Create a table for tracking admin actions (audit trail)
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action_type text NOT NULL,
  target_user_id uuid,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Super admins can view admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Super admins can insert admin actions" ON public.admin_actions;

-- Super admins can view all admin actions
CREATE POLICY "Super admins can view admin actions" 
ON public.admin_actions 
FOR SELECT 
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Super admins can insert admin actions
CREATE POLICY "Super admins can insert admin actions" 
ON public.admin_actions 
FOR INSERT 
TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()));