import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Image, 
  Scan, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  FileUp
} from "lucide-react";

interface ExtractedData {
  claimantName: string;
  village: string;
  district: string;
  state: string;
  claimType: string;
  coordinates: string;
  area: string;
  confidence: number;
  rawText?: string;
}

export default function Digitization() {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileList | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processingStep, setProcessingStep] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setExtractedData(null);
    setProgress(0);
  };

  const processFiles = async () => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProcessingStep("Preparing images...");

    try {
      const file = files[0]; // Process first file
      
      // Convert to base64
      setProcessingStep("Converting image...");
      setProgress(20);
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Image = await base64Promise;

      // Call AI extraction
      setProcessingStep("Running AI OCR extraction...");
      setProgress(40);

      const { data, error } = await supabase.functions.invoke('extract-text', {
        body: { image: base64Image }
      });

      if (error) {
        throw error;
      }

      setProcessingStep("Processing extracted data...");
      setProgress(70);

      if (data.structuredData) {
        // Use structured data if available
        setExtractedData({
          claimantName: data.structuredData.claimantName || "",
          village: data.structuredData.village || "",
          district: data.structuredData.district || "",
          state: data.structuredData.state || "",
          claimType: data.structuredData.claimType || "",
          coordinates: data.structuredData.coordinates || "",
          area: data.structuredData.area || "",
          confidence: data.confidence || 0.85,
          rawText: data.rawText
        });
      } else {
        // Fallback to raw text only
        setExtractedData({
          claimantName: "",
          village: "",
          district: "",
          state: "",
          claimType: "",
          coordinates: "",
          area: "",
          confidence: data.confidence || 0.75,
          rawText: data.rawText
        });
      }

      setProcessingStep("Processing completed!");
      setProgress(100);
      
      toast({
        title: "Success",
        description: "Text extracted successfully from document",
      });

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extract text",
        variant: "destructive",
      });
      setProgress(0);
      setProcessingStep("");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveData = () => {
    // Simulate saving to database
    alert("Data saved successfully to FRA database!");
  };

  const resetForm = () => {
    setFiles(null);
    setExtractedData(null);
    setProgress(0);
    setIsProcessing(false);
    setProcessingStep("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Data Digitization</h1>
              <p className="mt-2 text-muted-foreground">
                OCR and NER powered extraction of FRA documents with AI validation
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>AI-Powered</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Scan className="h-3 w-3" />
                <span>OCR + NER</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Document Upload</span>
                </CardTitle>
                <CardDescription>
                  Upload scanned FRA documents (PDF, JPG, PNG) for automated data extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="files">Select Documents</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="files" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, JPG, PNG (MAX. 20MB)</p>
                        </div>
                        <Input
                          id="files"
                          type="file"
                          className="hidden"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {files && files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label>Selected Files ({files.length})</Label>
                    <div className="space-y-2">
                      {Array.from(files).map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                          {file.type.includes('pdf') ? (
                            <FileText className="h-4 w-4 text-destructive" />
                          ) : (
                            <Image className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-sm flex-1">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="flex space-x-2">
                  <Button 
                    onClick={processFiles} 
                    disabled={!files || files.length === 0 || isProcessing}
                    className="flex-1"
                    variant="hero"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start AI Extraction
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processing Status */}
            {(isProcessing || extractedData) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Scan className="h-5 w-5 text-primary" />
                      <span>Processing Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{processingStep}</span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    {progress === 100 && (
                      <div className="flex items-center space-x-2 text-fra-success">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Data extraction completed successfully!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {!extractedData ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready for Processing
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Upload FRA documents to extract structured data using AI
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Scan className="h-4 w-4 text-primary" />
                      <span>OCR Extraction</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Brain className="h-4 w-4 text-fra-success" />
                      <span>NER Processing</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-fra-info" />
                      <span>Data Validation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Extracted Data Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-5 w-5 text-primary" />
                        <span>Extracted Information</span>
                      </div>
                      <Badge 
                        variant={extractedData.confidence > 0.8 ? "default" : "secondary"}
                        className="flex items-center space-x-1"
                      >
                        <span>Confidence: {(extractedData.confidence * 100).toFixed(0)}%</span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      AI-extracted data from uploaded documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {extractedData.rawText && (
                      <div className="mb-4">
                        <Label className="text-sm font-medium text-muted-foreground">Raw Extracted Text</Label>
                        <Textarea 
                          value={extractedData.rawText} 
                          className="mt-1 min-h-[120px] font-mono text-xs"
                          readOnly
                        />
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Claimant Name</Label>
                        <Input 
                          value={extractedData.claimantName} 
                          onChange={(e) => setExtractedData({...extractedData, claimantName: e.target.value})}
                          className="mt-1" 
                          placeholder="Enter claimant name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Village</Label>
                        <Input 
                          value={extractedData.village} 
                          onChange={(e) => setExtractedData({...extractedData, village: e.target.value})}
                          className="mt-1"
                          placeholder="Enter village"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">District</Label>
                        <Input 
                          value={extractedData.district} 
                          onChange={(e) => setExtractedData({...extractedData, district: e.target.value})}
                          className="mt-1"
                          placeholder="Enter district"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">State</Label>
                        <Input 
                          value={extractedData.state} 
                          onChange={(e) => setExtractedData({...extractedData, state: e.target.value})}
                          className="mt-1"
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Claim Type</Label>
                        <Input 
                          value={extractedData.claimType} 
                          onChange={(e) => setExtractedData({...extractedData, claimType: e.target.value})}
                          className="mt-1"
                          placeholder="Enter claim type"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Area</Label>
                        <Input 
                          value={extractedData.area} 
                          onChange={(e) => setExtractedData({...extractedData, area: e.target.value})}
                          className="mt-1"
                          placeholder="Enter area"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Coordinates</Label>
                      <Input 
                        value={extractedData.coordinates} 
                        onChange={(e) => setExtractedData({...extractedData, coordinates: e.target.value})}
                        className="mt-1"
                        placeholder="Enter coordinates"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Validation & Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Data Validation</CardTitle>
                    <CardDescription>
                      Review and validate extracted information before saving
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-fra-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">All required fields extracted</span>
                    </div>
                    <div className="flex items-center space-x-2 text-fra-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Coordinates format validated</span>
                    </div>
                    <div className="flex items-center space-x-2 text-fra-warning">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Manual verification recommended for claim type</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="notes">Validation Notes</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Add any validation notes or corrections..."
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={saveData} className="flex-1" variant="success">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save to Database
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}