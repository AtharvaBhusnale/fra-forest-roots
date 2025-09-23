import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Calendar, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Claim {
  id: string;
  claim_type: string;
  village: string;
  district: string;
  state: string;
  land_area: number;
  claim_description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submitted_at: string;
  remarks?: string;
}

const MyClaims = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setClaims((data || []) as Claim[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your claims.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Claims
          </h1>
          <p className="text-muted-foreground">
            Track the status of your Forest Rights Act claims
          </p>
        </div>

        {claims.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Claims Found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any claims yet.
              </p>
              <Link to="/apply-claim">
                <Button>Apply for New Claim</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {claims.length} Claim{claims.length !== 1 ? 's' : ''} Found
              </h2>
              <Link to="/apply-claim">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>

            {claims.map((claim) => (
              <Card key={claim.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="capitalize">
                        {claim.claim_type.replace('_', ' ')} Forest Rights
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {claim.village}, {claim.district}, {claim.state}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(claim.status)}>
                      {claim.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Submitted: {formatDate(claim.submitted_at)}
                      </span>
                    </div>
                    {claim.land_area && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          Land Area: {claim.land_area} hectares
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Description:</h4>
                    <p className="text-sm text-muted-foreground">
                      {claim.claim_description}
                    </p>
                  </div>

                  {claim.remarks && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h4 className="font-medium mb-1">Remarks:</h4>
                      <p className="text-sm text-muted-foreground">
                        {claim.remarks}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;