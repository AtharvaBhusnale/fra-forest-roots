import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Eye, FileText, Download, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Claim {
  id: string;
  user_id: string;
  claim_type: string;
  village: string;
  district: string;
  state: string;
  land_area: number | null;
  claim_description: string;
  status: string;
  remarks: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  documents: any;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

const ClaimsTable = () => {
  const { user, isOfficial } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [user, isOfficial]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      let query = supabase.from('claims').select('*');
      
      if (!isOfficial) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: "Error",
        description: "Failed to fetch claims",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claim_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    const matchesState = stateFilter === 'all' || claim.state === stateFilter;
    
    return matchesSearch && matchesStatus && matchesState;
  });

  const handleStatusUpdate = async () => {
    if (!selectedClaim || !newStatus || !isOfficial) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('claims')
        .update({
          status: newStatus,
          remarks: reviewRemarks || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', selectedClaim.id);

      if (error) throw error;

      toast({
        title: "Claim Updated",
        description: "Claim status has been updated successfully"
      });

      fetchClaims();
      setSelectedClaim(null);
      setReviewRemarks('');
      setNewStatus('');
    } catch (error) {
      console.error('Error updating claim:', error);
      toast({
        title: "Error",
        description: "Failed to update claim status",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'outline' as const, icon: Clock, color: 'text-yellow-600' },
      under_review: { variant: 'default' as const, icon: Eye, color: 'text-blue-600' },
      approved: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const exportClaims = () => {
    const csvContent = [
      ['ID', 'Type', 'Village', 'District', 'State', 'Land Area', 'Status', 'Submitted At'],
      ...filteredClaims.map(claim => [
        claim.id,
        claim.claim_type,
        claim.village,
        claim.district,
        claim.state,
        claim.land_area || '',
        claim.status,
        new Date(claim.submitted_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `claims-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueStates = [...new Set(claims.map(claim => claim.state))];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading claims...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Claims Management</CardTitle>
            <CardDescription>
              {isOfficial ? 'Review and manage all submitted claims' : 'View your submitted claims'}
            </CardDescription>
          </div>
          <Button onClick={exportClaims} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search">Search Claims</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by village, district, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="state-filter">State</Label>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Land Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No claims found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">
                      {claim.claim_type.replace('_', ' ').toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{claim.village}</div>
                        <div className="text-sm text-muted-foreground">
                          {claim.district}, {claim.state}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {claim.land_area ? `${claim.land_area} ha` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(claim.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(claim.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedClaim(claim)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Claim Details</DialogTitle>
                            <DialogDescription>
                              View and {isOfficial ? 'manage' : 'review'} claim information
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedClaim && (
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                {isOfficial && <TabsTrigger value="review">Review</TabsTrigger>}
                              </TabsList>
                              
                              <TabsContent value="details" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Claim Type</Label>
                                    <p className="text-sm mt-1">{selectedClaim.claim_type}</p>
                                  </div>
                                  <div>
                                    <Label>Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedClaim.status)}</div>
                                  </div>
                                  <div>
                                    <Label>Village</Label>
                                    <p className="text-sm mt-1">{selectedClaim.village}</p>
                                  </div>
                                  <div>
                                    <Label>District</Label>
                                    <p className="text-sm mt-1">{selectedClaim.district}</p>
                                  </div>
                                  <div>
                                    <Label>State</Label>
                                    <p className="text-sm mt-1">{selectedClaim.state}</p>
                                  </div>
                                  <div>
                                    <Label>Land Area</Label>
                                    <p className="text-sm mt-1">{selectedClaim.land_area || 'N/A'} hectares</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label>Description</Label>
                                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                                    {selectedClaim.claim_description}
                                  </p>
                                </div>
                                
                                {selectedClaim.remarks && (
                                  <div>
                                    <Label>Remarks</Label>
                                    <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
                                      {selectedClaim.remarks}
                                    </p>
                                  </div>
                                )}
                              </TabsContent>
                              
                              {isOfficial && (
                                <TabsContent value="review" className="space-y-4">
                                  <div>
                                    <Label htmlFor="new-status">Update Status</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="remarks">Review Remarks</Label>
                                    <Textarea
                                      id="remarks"
                                      value={reviewRemarks}
                                      onChange={(e) => setReviewRemarks(e.target.value)}
                                      placeholder="Add remarks about this claim..."
                                      rows={4}
                                    />
                                  </div>
                                  
                                  <Button
                                    onClick={handleStatusUpdate}
                                    disabled={!newStatus || submitting}
                                    className="w-full"
                                  >
                                    {submitting ? 'Updating...' : 'Update Claim Status'}
                                  </Button>
                                </TabsContent>
                              )}
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClaimsTable;