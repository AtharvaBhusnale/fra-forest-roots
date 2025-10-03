import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/common/StatsCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Download, 
  Filter, 
  TrendingUp, 
  Users, 
  MapPin, 
  TreePine, 
  CheckCircle,
  Clock,
  XCircle,
  Satellite,
  Loader2,
  RefreshCw
} from "lucide-react";
import { 
  Chart,
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--fra-success))', 'hsl(var(--fra-warning))', 'hsl(var(--fra-info))'];

interface DashboardStats {
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
  rejectedClaims: number;
  underReviewClaims: number;
  villagesCovered: number;
  digitizationCount: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalClaims: 0,
    approvedClaims: 0,
    pendingClaims: 0,
    rejectedClaims: 0,
    underReviewClaims: 0,
    villagesCovered: 0,
    digitizationCount: 0
  });
  const [claimsByState, setClaimsByState] = useState<any[]>([]);
  const [claimsByType, setClaimsByType] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all claims
      const { data: claims, error: claimsError } = await supabase
        .from('claims')
        .select('*');

      if (claimsError) throw claimsError;

      // Fetch digitization results
      const { data: digitization, error: digitizationError } = await supabase
        .from('digitization_results')
        .select('id');

      if (digitizationError) throw digitizationError;

      // Calculate statistics
      const total = claims?.length || 0;
      const approved = claims?.filter(c => c.status === 'approved').length || 0;
      const pending = claims?.filter(c => c.status === 'pending').length || 0;
      const rejected = claims?.filter(c => c.status === 'rejected').length || 0;
      const underReview = claims?.filter(c => c.status === 'under_review').length || 0;
      const villages = new Set(claims?.map(c => c.village)).size || 0;

      setStats({
        totalClaims: total,
        approvedClaims: approved,
        pendingClaims: pending,
        rejectedClaims: rejected,
        underReviewClaims: underReview,
        villagesCovered: villages,
        digitizationCount: digitization?.length || 0
      });

      // Group by state
      const stateGroups: any = {};
      claims?.forEach(claim => {
        if (!stateGroups[claim.state]) {
          stateGroups[claim.state] = { state: claim.state, approved: 0, pending: 0, rejected: 0 };
        }
        if (claim.status === 'approved') stateGroups[claim.state].approved++;
        if (claim.status === 'pending') stateGroups[claim.state].pending++;
        if (claim.status === 'rejected') stateGroups[claim.state].rejected++;
      });
      setClaimsByState(Object.values(stateGroups));

      // Group by type
      const typeGroups: any = {};
      claims?.forEach(claim => {
        const type = claim.claim_type === 'individual' ? 'Individual Rights' : 'Community Rights';
        if (!typeGroups[type]) {
          typeGroups[type] = { name: type, count: 0 };
        }
        typeGroups[type].count++;
      });
      setClaimsByType(Object.values(typeGroups));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const approvalRate = stats.totalClaims > 0 
    ? ((stats.approvedClaims / stats.totalClaims) * 100).toFixed(1) 
    : '0';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Real-time reporting and progress tracking for FRA implementation
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatsCard
            title="Total Claims"
            value={stats.totalClaims.toLocaleString()}
            description="Claims processed across states"
            icon={TreePine}
            trend={approvalRate + "% approved"}
            color="primary"
          />
          <StatsCard
            title="Approved"
            value={stats.approvedClaims.toLocaleString()}
            description="Successfully approved claims"
            icon={CheckCircle}
            trend={`${stats.approvedClaims} / ${stats.totalClaims}`}
            color="success"
          />
          <StatsCard
            title="Villages Covered"
            value={stats.villagesCovered.toLocaleString()}
            description="Unique villages with claims"
            icon={MapPin}
            trend={`${stats.totalClaims} total claims`}
            color="info"
          />
          <StatsCard
            title="Digitized Docs"
            value={stats.digitizationCount.toLocaleString()}
            description="AI-processed documents"
            icon={Satellite}
            trend="OCR + NER powered"
            color="warning"
          />
        </motion.div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Claims by State */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Claims by State</CardTitle>
                    <CardDescription>Distribution of FRA claims across states</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {claimsByState.length === 0 ? (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    ) : (
                      <ChartContainer config={{}} className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={claimsByState}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="state" 
                              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                              angle={-45}
                              textAnchor="end"
                              height={100}
                            />
                            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                            <ChartTooltip />
                            <Bar dataKey="approved" stackId="a" fill="hsl(var(--fra-success))" name="Approved" />
                            <Bar dataKey="pending" stackId="a" fill="hsl(var(--fra-warning))" name="Pending" />
                            <Bar dataKey="rejected" stackId="a" fill="hsl(var(--destructive))" name="Rejected" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Claim Type Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Claim Type Distribution</CardTitle>
                    <CardDescription>Individual vs Community Rights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {claimsByType.length === 0 ? (
                      <div className="h-80 flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    ) : (
                      <ChartContainer config={{}} className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={claimsByType}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, count }) => `${name}: ${count}`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {claimsByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-fra-success" />
                    <span>Approved</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fra-success">{stats.approvedClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {approvalRate}% approval rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-fra-warning" />
                    <span>Pending</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fra-warning">{stats.pendingClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Awaiting review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TreePine className="h-5 w-5 text-fra-info" />
                    <span>Under Review</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fra-info">{stats.underReviewClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Being processed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span>Rejected</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{stats.rejectedClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.totalClaims > 0 ? ((stats.rejectedClaims / stats.totalClaims) * 100).toFixed(1) : '0'}% rejection rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Progress</CardTitle>
                <CardDescription>Implementation status of FRA digitization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Claims Processing</span>
                      <span className="text-sm font-medium">{approvalRate}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-gradient-primary h-3 rounded-full transition-all" style={{ width: `${approvalRate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Document Digitization</span>
                      <span className="text-sm font-medium">
                        {stats.totalClaims > 0 ? ((stats.digitizationCount / stats.totalClaims) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-fra-success h-3 rounded-full transition-all" style={{ 
                        width: `${stats.totalClaims > 0 ? ((stats.digitizationCount / stats.totalClaims) * 100) : 0}%` 
                      }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Geographic Coverage</span>
                      <span className="text-sm font-medium">{stats.villagesCovered} villages</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-fra-info h-3 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}