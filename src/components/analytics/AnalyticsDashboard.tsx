import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

interface AnalyticsData {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  underReviewClaims: number;
  avgProcessingTime: number;
  claimsByType: any[];
  claimsByState: any[];
  trendsData: any[];
}

export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    underReviewClaims: 0,
    avgProcessingTime: 0,
    claimsByType: [],
    claimsByState: [],
    trendsData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: claims, error } = await supabase
        .from('claims')
        .select('*');

      if (error) throw error;

      const total = claims?.length || 0;
      const pending = claims?.filter(c => c.status === 'pending').length || 0;
      const approved = claims?.filter(c => c.status === 'approved').length || 0;
      const rejected = claims?.filter(c => c.status === 'rejected').length || 0;
      const underReview = claims?.filter(c => c.status === 'under_review').length || 0;

      // Calculate avg processing time for reviewed claims
      const reviewedClaims = claims?.filter(c => c.reviewed_at) || [];
      const avgTime = reviewedClaims.reduce((acc, claim) => {
        const submitted = new Date(claim.submitted_at).getTime();
        const reviewed = new Date(claim.reviewed_at).getTime();
        return acc + (reviewed - submitted);
      }, 0) / (reviewedClaims.length || 1);
      const avgDays = Math.round(avgTime / (1000 * 60 * 60 * 24));

      // Claims by type
      const typeCount: any = {};
      claims?.forEach(claim => {
        typeCount[claim.claim_type] = (typeCount[claim.claim_type] || 0) + 1;
      });
      const byType = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

      // Claims by state
      const stateCount: any = {};
      claims?.forEach(claim => {
        stateCount[claim.state] = (stateCount[claim.state] || 0) + 1;
      });
      const byState = Object.entries(stateCount).map(([name, value]) => ({ name, value }));

      // Trends (last 6 months)
      const monthlyData: any = {};
      claims?.forEach(claim => {
        const month = new Date(claim.submitted_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (!monthlyData[month]) {
          monthlyData[month] = { month, submitted: 0, approved: 0, rejected: 0 };
        }
        monthlyData[month].submitted++;
        if (claim.status === 'approved') monthlyData[month].approved++;
        if (claim.status === 'rejected') monthlyData[month].rejected++;
      });
      const trends = Object.values(monthlyData).slice(-6);

      setAnalytics({
        totalClaims: total,
        pendingClaims: pending,
        approvedClaims: approved,
        rejectedClaims: rejected,
        underReviewClaims: underReview,
        avgProcessingTime: avgDays,
        claimsByType: byType,
        claimsByState: byState,
        trendsData: trends as any[]
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'];

  if (loading) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClaims}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pendingClaims}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.approvedClaims}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.rejectedClaims}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgProcessingTime} days</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Claims by Type</CardTitle>
            <CardDescription>Distribution of claim types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.claimsByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.claimsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claims by State</CardTitle>
            <CardDescription>Top states by claim volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.claimsByState.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim Trends (Last 6 Months)</CardTitle>
          <CardDescription>Submissions vs Approvals/Rejections</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submitted" stroke="#667eea" strokeWidth={2} />
              <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
