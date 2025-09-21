import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/common/StatsCard";
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
  Satellite
} from "lucide-react";
import { 
  Chart,
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { mockStats, claimsByStateData, assetTypeData, monthlyProgressData } from "@/data/mockData";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--fra-success))', 'hsl(var(--fra-warning))', 'hsl(var(--fra-info))'];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="mt-2 text-muted-foreground">
                Comprehensive reporting and progress tracking for FRA implementation
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export Report
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
            value={mockStats.totalClaims.toLocaleString()}
            description="Claims processed across states"
            icon={TreePine}
            trend="+12%"
            color="primary"
          />
          <StatsCard
            title="Approved"
            value={mockStats.approvedClaims.toLocaleString()}
            description="Successfully approved claims"
            icon={CheckCircle}
            trend="+8%"
            color="success"
          />
          <StatsCard
            title="Villages Covered"
            value={mockStats.villagesCovered.toLocaleString()}
            description="Villages with FRA mapping"
            icon={MapPin}
            trend="+15%"
            color="info"
          />
          <StatsCard
            title="Assets Mapped"
            value={mockStats.assetsMapped.toLocaleString()}
            description="AI-detected land assets"
            icon={Satellite}
            trend="+23%"
            color="warning"
          />
        </motion.div>

        {/* Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="claims">Claims Analysis</TabsTrigger>
            <TabsTrigger value="assets">Asset Mapping</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
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
                    <ChartContainer config={{}} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={claimsByStateData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis 
                            dataKey="state" 
                            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                          <ChartTooltip />
                          <Bar dataKey="approved" stackId="a" fill="hsl(var(--fra-success))" name="Approved" />
                          <Bar dataKey="pending" stackId="a" fill="hsl(var(--fra-warning))" name="Pending" />
                          <Bar dataKey="rejected" stackId="a" fill="hsl(var(--destructive))" name="Rejected" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Asset Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Distribution</CardTitle>
                    <CardDescription>Types of assets mapped through satellite imagery</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assetTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} (${percentage}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {assetTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Progress Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress</CardTitle>
                  <CardDescription>Claims processing and asset mapping progress over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyProgressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                        <ChartTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="claims" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          name="Claims Processed"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="assets" 
                          stroke="hsl(var(--fra-success))" 
                          strokeWidth={3}
                          name="Assets Mapped"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="claims" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-fra-success" />
                    <span>Approved Claims</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fra-success">{mockStats.approvedClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((mockStats.approvedClaims / mockStats.totalClaims) * 100).toFixed(1)}% approval rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-fra-warning" />
                    <span>Pending Claims</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-fra-warning">{mockStats.pendingClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Awaiting review and verification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span>Rejected Claims</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">{mockStats.rejectedClaims.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((mockStats.rejectedClaims / mockStats.totalClaims) * 100).toFixed(1)}% rejection rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Detection Accuracy</CardTitle>
                  <CardDescription>Confidence levels of satellite-based asset detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Forest Cover</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-fra-success h-2 rounded-full" style={{ width: '89%' }}></div>
                        </div>
                        <span className="text-sm font-medium">89%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Water Bodies</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-fra-info h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Agricultural Land</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-fra-warning h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Homesteads</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset Coverage</CardTitle>
                  <CardDescription>Geographic distribution of mapped assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">4</div>
                      <div className="text-sm text-muted-foreground">States Covered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-fra-success">127</div>
                      <div className="text-sm text-muted-foreground">Districts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-fra-warning">2,341</div>
                      <div className="text-sm text-muted-foreground">Villages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-fra-info">98.5%</div>
                      <div className="text-sm text-muted-foreground">Coverage Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Progress</CardTitle>
                <CardDescription>Overall progress of FRA digitization initiative</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Data Digitization</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-gradient-primary h-3 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Asset Mapping</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-gradient-earth h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Claims Processing</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div className="bg-fra-success h-3 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">DSS Implementation</span>
                      <span className="text-sm font-medium">42%</span>
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