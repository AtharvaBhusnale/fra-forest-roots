-- Enable RLS on exports table (was missing)
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notifications table (was missing) 
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;