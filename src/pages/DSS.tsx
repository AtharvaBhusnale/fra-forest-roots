import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  TrendingUp,
  Users,
  Droplets,
  Coins,
  Briefcase,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { mockFRAClaims, mockSchemeRecommendations } from "@/data/mockData";

export default function DSS() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedClaimant, setSelectedClaimant] = useState("");
  const [recommendations, setRecommendations] = useState(false);

  const runDSS = () => {
    setRecommendations(true);
  };

  const resetForm = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedVillage("");
    setSelectedClaimant("");
    setRecommendations(false);
  };

  const states = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"];
  const districts = {
    "Madhya Pradesh": ["Khandwa", "Jabalpur"],
    "Tripura": ["West Tripura"],
    "Odisha": ["Khordha"],
    "Telangana": ["Warangal"]
  };

  const villages = mockFRAClaims
    .filter(claim => (!selectedState || claim.state === selectedState) && 
                    (!selectedDistrict || claim.district === selectedDistrict))
    .map(claim => claim.village)
    .filter((village, index, self) => self.indexOf(village) === index);

  const claimants = mockFRAClaims
    .filter(claim => (!selectedState || claim.state === selectedState) && 
                    (!selectedDistrict || claim.district === selectedDistrict) &&
                    (!selectedVillage || claim.village === selectedVillage))
    .map(claim => ({ name: claim.claimantName, id: claim.id }));

  const selectedClaimData = mockFRAClaims.find(claim => claim.id === selectedClaimant);

  const schemeIcons = {
    "PM-KISAN": Coins,
    "Jal Jeevan Mission": Droplets,
    "MGNREGA": Briefcase,
    "DAJGUA": Users
  };

  const priorityColors = {
    "High": "destructive",
    "Medium": "warning", 
    "Low": "secondary"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Decision Support System</h1>
              <p className="mt-2 text-muted-foreground">
                AI-powered CSS scheme recommendations for FRA beneficiaries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Brain className="h-3 w-3" />
                <span>AI-Powered</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Selection Criteria</span>
                </CardTitle>
                <CardDescription>
                  Select location and claimant for scheme recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">District</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedState && districts[selectedState as keyof typeof districts]?.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Village</Label>
                  <Select value={selectedVillage} onValueChange={setSelectedVillage} disabled={!selectedDistrict}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages.map(village => (
                        <SelectItem key={village} value={village}>{village}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Claimant</Label>
                  <Select value={selectedClaimant} onValueChange={setSelectedClaimant} disabled={!selectedVillage}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select claimant" />
                    </SelectTrigger>
                    <SelectContent>
                      {claimants.map(claimant => (
                        <SelectItem key={claimant.id} value={claimant.id}>{claimant.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex space-x-2">
                  <Button 
                    onClick={runDSS} 
                    disabled={!selectedClaimant}
                    className="flex-1"
                    variant="hero"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Run DSS Analysis
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Claimant Info */}
            {selectedClaimData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Claimant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="text-sm font-medium">{selectedClaimData.claimantName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Location</Label>
                      <p className="text-sm">{selectedClaimData.village}, {selectedClaimData.district}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Claim Details</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{selectedClaimData.claimType}</Badge>
                        <Badge variant={selectedClaimData.status === 'Approved' ? 'default' : 'secondary'}>
                          {selectedClaimData.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Area</Label>
                      <p className="text-sm">{selectedClaimData.area} hectares</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {!recommendations ? (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center p-12">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready for Analysis
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Select a claimant and run the DSS analysis to get AI-powered scheme recommendations
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-fra-success" />
                      <span>Rule-based engine</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-fra-info" />
                      <span>Eligibility matching</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-fra-warning" />
                      <span>Priority scoring</span>
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
                {/* Analysis Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      <span>DSS Analysis Results</span>
                    </CardTitle>
                    <CardDescription>
                      AI-powered recommendations based on eligibility criteria and priority scoring
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">4</div>
                        <div className="text-sm text-muted-foreground">Eligible Schemes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-fra-success">2</div>
                        <div className="text-sm text-muted-foreground">High Priority</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-fra-info">Rs 85,000</div>
                        <div className="text-sm text-muted-foreground">Est. Annual Benefits</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scheme Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">Scheme Recommendations</h3>
                  <div className="grid gap-4">
                    {mockSchemeRecommendations.map((scheme, index) => {
                      const Icon = schemeIcons[scheme.scheme as keyof typeof schemeIcons] || Info;
                      return (
                        <motion.div
                          key={scheme.scheme}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="hover:shadow-soft transition-all">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-lg">{scheme.scheme}</CardTitle>
                                    <CardDescription>{scheme.description}</CardDescription>
                                  </div>
                                </div>
                                <Badge variant={priorityColors[scheme.priority as keyof typeof priorityColors] as any}>
                                  {scheme.priority} Priority
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Benefits</Label>
                                  <p className="text-sm text-muted-foreground mt-1">{scheme.benefits}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-foreground">Eligibility Criteria</Label>
                                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                    {scheme.eligibilityCriteria.map((criteria, i) => (
                                      <li key={i} className="flex items-center space-x-2">
                                        <CheckCircle className="h-3 w-3 text-fra-success flex-shrink-0" />
                                        <span>{criteria}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="flex justify-end">
                                  <Button variant="outline" size="sm">
                                    Apply Now
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}