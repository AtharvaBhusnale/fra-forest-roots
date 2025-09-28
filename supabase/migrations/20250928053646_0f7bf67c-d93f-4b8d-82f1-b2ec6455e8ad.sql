-- Create storage buckets for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('claim-documents', 'claim-documents', false),
  ('profile-avatars', 'profile-avatars', true);

-- Create storage policies for claim documents
CREATE POLICY "Users can upload their own claim documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own claim documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'claim-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Officials can view all claim documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'claim-documents' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'official'
));

-- Create storage policies for profile avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add notification preferences to profiles
ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "sms": false}'::jsonb;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create notification policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Officials can create notifications for users
CREATE POLICY "Officials can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role IN ('official', 'super_admin')
));

-- Create trigger for notification timestamps
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create exports table for data export tracking
CREATE TABLE public.exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  export_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing',
  file_url TEXT,
  filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on exports
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Create export policies
CREATE POLICY "Users can view their own exports" 
ON public.exports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports" 
ON public.exports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create claim status change function
CREATE OR REPLACE FUNCTION public.handle_claim_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If status changed, create notification
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.user_id,
      'Claim Status Updated',
      CASE NEW.status
        WHEN 'approved' THEN 'Your claim has been approved!'
        WHEN 'rejected' THEN 'Your claim has been rejected. Please check the remarks for details.'
        WHEN 'under_review' THEN 'Your claim is now under review by our officials.'
        ELSE 'Your claim status has been updated to: ' || NEW.status
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'success'
        WHEN 'rejected' THEN 'error'
        ELSE 'info'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for claim status changes
CREATE TRIGGER on_claim_status_change
  AFTER UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_claim_status_change();