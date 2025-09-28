import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Upload, File, X, Download, Eye } from 'lucide-react';

interface DocumentUploadProps {
  claimId?: string;
  onUploadComplete?: (documents: any[]) => void;
  existingDocuments?: any[];
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  claimId,
  onUploadComplete,
  existingDocuments = []
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [documents, setDocuments] = useState<any[]>(existingDocuments);

  const handleFiles = useCallback(async (files: FileList) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading',
      id: crypto.randomUUID()
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    for (const uploadingFile of newUploadingFiles) {
      try {
        const fileName = `${user?.id}/${uploadingFile.id}-${uploadingFile.file.name}`;
        
        const { data, error } = await supabase.storage
          .from('claim-documents')
          .upload(fileName, uploadingFile.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Update progress to 100%
        setUploadingFiles(prev =>
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, progress: 100, status: 'success' as const }
              : f
          )
        );

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('claim-documents')
          .getPublicUrl(fileName);

        const newDocument = {
          id: uploadingFile.id,
          name: uploadingFile.file.name,
          type: uploadingFile.file.type,
          size: uploadingFile.file.size,
          url: urlData.publicUrl,
          uploaded_at: new Date().toISOString()
        };

        setDocuments(prev => {
          const updated = [...prev, newDocument];
          onUploadComplete?.(updated);
          return updated;
        });

        // If we have a claimId, update the claim with the new document
        if (claimId) {
          const { error: updateError } = await supabase
            .from('claims')
            .update({
              documents: [...documents, newDocument]
            })
            .eq('id', claimId);

          if (updateError) {
            console.error('Error updating claim documents:', updateError);
          }
        }

        toast({
          title: "Upload successful",
          description: `${uploadingFile.file.name} has been uploaded`
        });

      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadingFiles(prev =>
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'error' as const }
              : f
          )
        );
        
        toast({
          title: "Upload failed",
          description: `Failed to upload ${uploadingFile.file.name}`,
          variant: "destructive"
        });
      }
    }

    // Remove completed uploads after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
    }, 3000);
  }, [user, toast, onUploadComplete, claimId, documents]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeDocument = async (documentId: string) => {
    try {
      const document = documents.find(d => d.id === documentId);
      if (document) {
        // Remove from storage
        const fileName = `${user?.id}/${document.id}-${document.name}`;
        await supabase.storage
          .from('claim-documents')
          .remove([fileName]);
      }

      const updatedDocuments = documents.filter(d => d.id !== documentId);
      setDocuments(updatedDocuments);
      onUploadComplete?.(updatedDocuments);

      // Update claim if claimId exists
      if (claimId) {
        await supabase
          .from('claims')
          .update({ documents: updatedDocuments })
          .eq('id', claimId);
      }

      toast({
        title: "Document removed",
        description: "Document has been successfully removed"
      });
    } catch (error) {
      console.error('Error removing document:', error);
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    return '📎';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload supporting documents for your claim (PDF, Images, Word documents)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            Drag and drop files here, or click to select
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, JPG, PNG, DOC, DOCX up to 10MB each
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Files
            </label>
          </Button>
        </div>

        {/* Uploading Files */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploading...</h4>
            {uploadingFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <span className="text-lg">{getFileIcon(file.file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="w-full mt-1" />
                  )}
                </div>
                <Badge variant={
                  file.status === 'success' ? 'default' : 
                  file.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {file.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Documents</h4>
            {documents.map((document) => (
              <div key={document.id} className="flex items-center space-x-3 p-3 bg-card border rounded-lg">
                <span className="text-lg">{getFileIcon(document.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{document.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(document.size)} • Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = document.url;
                      link.download = document.name;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(document.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;