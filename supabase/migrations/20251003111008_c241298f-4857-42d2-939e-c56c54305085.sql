-- Fix critical RLS policy gaps

-- 1. Prevent deletion of claims (use soft delete instead)
CREATE POLICY "Prevent claim deletion" 
ON public.claims 
FOR DELETE 
USING (false);

-- 2. Prevent deletion of profiles (data integrity)
CREATE POLICY "Prevent profile deletion" 
ON public.profiles 
FOR DELETE 
USING (false);

-- 3. Allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Prevent updates to exports (records should be immutable)
CREATE POLICY "Prevent export updates" 
ON public.exports 
FOR UPDATE 
USING (false);

-- 5. Allow users to delete their own exports
CREATE POLICY "Users can delete their own exports" 
ON public.exports 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Make admin_actions audit log immutable
CREATE POLICY "Prevent admin action updates" 
ON public.admin_actions 
FOR UPDATE 
USING (false);

CREATE POLICY "Prevent admin action deletion" 
ON public.admin_actions 
FOR DELETE 
USING (false);