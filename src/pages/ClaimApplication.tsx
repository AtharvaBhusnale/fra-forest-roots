import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText, Upload, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DocumentUpload from '@/components/documents/DocumentUpload';
import { z } from 'zod';

const claimSchema = z.object({
  claim_type: z.string().min(1, "Claim type is required"),
  village: z.string().min(1, "Village is required").max(200),
  district: z.string().min(1, "District is required").max(200),
  state: z.string().min(1, "State is required").max(200),
  land_area: z.string().optional(),
  claim_description: z.string().min(10, "Description must be at least 10 characters").max(2000),
});

const ClaimApplication = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    claim_type: '',
    village: '',
    district: '',
    state: '',
    land_area: '',
    claim_description: '',
    coordinates: ''
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [digitizationId, setDigitizationId] = useState<string | null>(null);

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  // Pre-fill form from digitization data
  useEffect(() => {
    if (location.state?.extractedData) {
      const extracted = location.state.extractedData;
      setFormData({
        claim_type: extracted.claimType === 'Individual Forest Rights' ? 'individual' : 'community',
        village: extracted.village || '',
        district: extracted.district || '',
        state: extracted.state || '',
        land_area: extracted.area || '',
        claim_description: `Claim for ${extracted.claimType} in ${extracted.village}, ${extracted.district}`,
        coordinates: extracted.coordinates || ''
      });
      setDigitizationId(location.state.digitizationId);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a claim.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = claimSchema.parse(formData);

      // Parse coordinates if provided
      let coordinatesJson = null;
      if (formData.coordinates) {
        const coords = formData.coordinates.split(',').map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !coords.some(isNaN)) {
          coordinatesJson = { lat: coords[0], lng: coords[1] };
        }
      }

      const { data: claimData, error } = await supabase
        .from('claims')
        .insert({
          user_id: user.id,
          claim_type: validatedData.claim_type,
          village: validatedData.village,
          district: validatedData.district,
          state: validatedData.state,
          land_area: validatedData.land_area ? parseFloat(validatedData.land_area) : null,
          claim_description: validatedData.claim_description,
          documents: documents,
          coordinates: coordinatesJson,
          digitization_result_id: digitizationId
        })
        .select()
        .single();

      if (error) throw error;

      // Update digitization result with claim_id if exists
      if (digitizationId) {
        await supabase
          .from('digitization_results')
          .update({ claim_id: claimData.id })
          .eq('id', digitizationId);
      }

      toast({
        title: "Claim Submitted Successfully",
        description: "Your FRA claim has been submitted and is under review."
      });

      // Reset form
      setFormData({
        claim_type: '',
        village: '',
        district: '',
        state: '',
        land_area: '',
        claim_description: '',
        coordinates: ''
      });
      setDocuments([]);
      setDigitizationId(null);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Submission Failed",
          description: error.message || "Failed to submit claim. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Forest Rights Act - Claim Application
          </h1>
          <p className="text-muted-foreground">
            Submit your application for forest rights recognition
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Claim Application
            </CardTitle>
            <CardDescription>
              Fill out all required information to submit your FRA claim
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claim-type">Claim Type *</Label>
                  <Select value={formData.claim_type} onValueChange={(value) => handleInputChange('claim_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual Forest Rights</SelectItem>
                      <SelectItem value="community">Community Forest Rights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="Enter district name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    value={formData.village}
                    onChange={(e) => handleInputChange('village', e.target.value)}
                    placeholder="Enter village name"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="land-area">Land Area (in hectares)</Label>
                  <Input
                    id="land-area"
                    type="number"
                    step="0.01"
                    value={formData.land_area}
                    onChange={(e) => handleInputChange('land_area', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Claim Description *</Label>
                <Textarea
                  id="description"
                  value={formData.claim_description}
                  onChange={(e) => handleInputChange('claim_description', e.target.value)}
                  placeholder="Provide detailed description of your forest rights claim..."
                  rows={4}
                  required
                />
              </div>

              <DocumentUpload
                onUploadComplete={(uploadedDocuments) => setDocuments(uploadedDocuments)}
                existingDocuments={documents}
              />

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting || !formData.claim_type || !formData.village || !formData.district || !formData.state || !formData.claim_description}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setFormData({
                    claim_type: '',
                    village: '',
                    district: '',
                    state: '',
                    land_area: '',
                    claim_description: '',
                    coordinates: ''
                  })}
                >
                  Reset Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClaimApplication;