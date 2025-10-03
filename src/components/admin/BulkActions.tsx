import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckSquare, Loader2 } from "lucide-react";

interface BulkActionsProps {
  selectedClaims: string[];
  onComplete: () => void;
}

export const BulkActions = ({ selectedClaims, onComplete }: BulkActionsProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | 'under_review'>('under_review');
  const [remarks, setRemarks] = useState('');
  const { toast } = useToast();

  const handleBulkAction = async () => {
    if (selectedClaims.length === 0) {
      toast({
        title: "No claims selected",
        description: "Please select claims to perform bulk actions",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('claims')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          remarks: remarks || null
        })
        .in('id', selectedClaims);

      if (error) throw error;

      toast({
        title: "Bulk action completed",
        description: `${selectedClaims.length} claims updated to ${action.replace('_', ' ')}`,
      });

      setOpen(false);
      setRemarks('');
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error performing bulk action",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedClaims.length === 0}>
          <CheckSquare className="h-4 w-4 mr-2" />
          Bulk Actions ({selectedClaims.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Action on {selectedClaims.length} Claims</DialogTitle>
          <DialogDescription>
            Apply the same status and remarks to all selected claims
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <Select value={action} onValueChange={(value: any) => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">Move to Under Review</SelectItem>
                <SelectItem value="approve">Approve All</SelectItem>
                <SelectItem value="reject">Reject All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Remarks (Optional)</label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks for all selected claims..."
              rows={4}
            />
          </div>

          <Button onClick={handleBulkAction} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Apply to ${selectedClaims.length} Claims`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
