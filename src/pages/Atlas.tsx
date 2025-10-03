import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Filter, 
  Search, 
  Info, 
  Users, 
  TreePine, 
  Droplets, 
  Home,
  Layers,
  ZoomIn,
  Download,
  Share2,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LeafletMap from "@/components/map/LeafletMap";

interface Claim {
  id: string;
  user_id: string;
  claim_type: string;
  village: string;
  district: string;
  state: string;
  status: string;
  land_area: number | null;
  coordinates: any;
  claim_description: string;
  submitted_at: string;
}

interface MapClaim {
  id: string;
  claimantName: string;
  village: string;
  district: string;
  state: string;
  claimType: string;
  status: string;
  area: number;
  lat: number;
  lng: number;
  coordinates: string;
  submissionDate: string;
  eligibleSchemes: string[];
}

export default function Atlas() {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedClaimType, setSelectedClaimType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLayer, setActiveLayer] = useState("claims");
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const states = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana", "Andhra Pradesh", "Maharashtra", "Chhattisgarh"];

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: "Error",
        description: "Failed to load claims data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    return (!selectedState || claim.state === selectedState) &&
           (!selectedDistrict || claim.district === selectedDistrict) &&
           (!selectedClaimType || claim.claim_type === selectedClaimType) &&
           (!searchQuery || 
             claim.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
             claim.district.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Get unique districts for selected state
  const districts = selectedState 
    ? [...new Set(claims.filter(c => c.state === selectedState).map(c => c.district))]
    : [];

  const handleClaimClick = (claim: Claim) => {
    setSelectedClaim(claim.id);
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'under_review': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">FRA Atlas</h1>
              <p className="mt-2 text-muted-foreground">
                Interactive WebGIS portal for Forest Rights Act claims and assets
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={fetchClaims}>
                <Download className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-border bg-card overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by village or district..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Filters</Label>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <Select value={selectedState} onValueChange={(value) => {
                    setSelectedState(value === "all" ? "" : value);
                    setSelectedDistrict(""); // Reset district when state changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">District</Label>
                  <Select value={selectedDistrict} onValueChange={(value) => setSelectedDistrict(value === "all" ? "" : value)} disabled={!selectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Claim Type</Label>
                  <Select value={selectedClaimType} onValueChange={(value) => setSelectedClaimType(value === "all" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="individual">Individual Forest Rights</SelectItem>
                      <SelectItem value="community">Community Forest Rights</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Statistics</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs">Approved</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {claims.filter(c => c.status === 'approved').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-xs">Pending</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {claims.filter(c => c.status === 'pending').length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs">Under Review</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {claims.filter(c => c.status === 'under_review').length}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Claims ({filteredClaims.length})</Label>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredClaims.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No claims found
                    </p>
                  ) : (
                    filteredClaims.map((claim) => (
                      <motion.div
                        key={claim.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group"
                        onClick={() => handleClaimClick(claim)}
                      >
                        <Card className={`p-3 hover:shadow-md transition-all cursor-pointer ${
                          selectedClaim === claim.id ? 'ring-2 ring-primary shadow-md' : ''
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-foreground">
                                {claim.village}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {claim.district}, {claim.state}
                              </p>
                              <div className="mt-2 flex items-center space-x-2">
                                <Badge 
                                  variant={statusColor(claim.status)}
                                  className="text-xs"
                                >
                                  {claim.status.replace('_', ' ')}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {claim.claim_type}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              {claim.land_area && (
                                <p className="text-xs text-muted-foreground">{claim.land_area} ha</p>
                              )}
                              {claim.coordinates && (
                                <MapPin className="h-3 w-3 text-primary mt-1" />
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <LeafletMap 
            claims={filteredClaims.filter(c => c.coordinates).map(c => {
              const coords = c.coordinates as { lat: number; lng: number } | null;
              const mapClaimType = c.claim_type === 'individual' ? 'IFR' : 'CR';
              const mapStatus = c.status.charAt(0).toUpperCase() + c.status.slice(1).replace('_', ' ');
              const normalizedStatus = mapStatus === 'Approved' ? 'Approved' : mapStatus === 'Rejected' ? 'Rejected' : 'Pending';
              return {
                id: c.id,
                claimantName: c.village,
                village: c.village,
                district: c.district,
                state: c.state,
                claimType: mapClaimType as "CFR" | "CR" | "IFR",
                status: normalizedStatus as "Approved" | "Pending" | "Rejected",
                area: c.land_area || 0,
                coordinates: [coords?.lat || 0, coords?.lng || 0] as [number, number],
                submissionDate: new Date(c.submitted_at).toLocaleDateString(),
                eligibleSchemes: []
              };
            })}
            assets={[]}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            onClaimClick={(claim: any) => {
              const foundClaim = claims.find(c => c.id === claim.id);
              if (foundClaim) handleClaimClick(foundClaim);
            }}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <div className="flex flex-col space-y-2">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs">
                Total Claims: {filteredClaims.length}
              </Badge>
              <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs">
                With Coordinates: {filteredClaims.filter(c => c.coordinates).length}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}