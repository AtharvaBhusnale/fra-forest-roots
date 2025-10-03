-- Create digitization_results table to store OCR extracted data
CREATE TABLE public.digitization_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  raw_text TEXT,
  extracted_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  claim_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digitization_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own digitization results
CREATE POLICY "Users can view their own digitization results"
ON public.digitization_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own digitization results
CREATE POLICY "Users can insert their own digitization results"
ON public.digitization_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own digitization results
CREATE POLICY "Users can update their own digitization results"
ON public.digitization_results
FOR UPDATE
USING (auth.uid() = user_id);

-- Officials can view all digitization results
CREATE POLICY "Officials can view all digitization results"
ON public.digitization_results
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE user_id = auth.uid() AND role IN ('official', 'super_admin')
));

-- Officials can update all digitization results
CREATE POLICY "Officials can update all digitization results"
ON public.digitization_results
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE user_id = auth.uid() AND role IN ('official', 'super_admin')
));

-- Prevent deletion
CREATE POLICY "Prevent digitization result deletion"
ON public.digitization_results
FOR DELETE
USING (false);

-- Add trigger for updated_at
CREATE TRIGGER update_digitization_results_updated_at
BEFORE UPDATE ON public.digitization_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add coordinates column to claims for map integration
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS coordinates JSONB,
ADD COLUMN IF NOT EXISTS digitization_result_id UUID;