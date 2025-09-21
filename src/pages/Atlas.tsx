import { useState, useEffect, useRef } from "react";
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
  Share2
} from "lucide-react";
import { mockFRAClaims, mockAssets } from "@/data/mockData";

// Mock Mapbox component since we need API key
const MapboxMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simulate map loading
    setTimeout(() => setMapLoaded(true), 1000);
  }, []);

  return (
    <div ref={mapContainer} className="w-full h-full bg-muted rounded-lg relative overflow-hidden">
      {!mapLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading Interactive Map...</p>
            <p className="text-xs text-muted-foreground mt-2">Configure Mapbox API key to enable mapping</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-fra-forest/20 to-fra-earth/20">
          <div className="absolute inset-4 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Interactive FRA Atlas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This would show Mapbox GL JS with FRA claims, boundaries, and satellite assets
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">IFR Claims</Badge>
                <Badge variant="secondary">Community Rights</Badge>
                <Badge variant="secondary">Forest Resources</Badge>
                <Badge variant="secondary">Water Bodies</Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Atlas() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedClaimType, setSelectedClaimType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLayer, setActiveLayer] = useState("claims");

  const states = ["Madhya Pradesh", "Tripura", "Odisha", "Telangana"];
  const districts = {
    "Madhya Pradesh": ["Khandwa", "Jabalpur", "Indore", "Bhopal"],
    "Tripura": ["West Tripura", "North Tripura", "South Tripura"],
    "Odisha": ["Khordha", "Puri", "Cuttack", "Mayurbhanj"],
    "Telangana": ["Warangal", "Hyderabad", "Nizamabad", "Karimnagar"]
  };

  const filteredClaims = mockFRAClaims.filter(claim => {
    return (!selectedState || claim.state === selectedState) &&
           (!selectedDistrict || claim.district === selectedDistrict) &&
           (!selectedClaimType || claim.claimType === selectedClaimType) &&
           (!searchQuery || claim.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            claim.village.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const layerIcons = {
    claims: TreePine,
    assets: Layers,
    water: Droplets,
    settlements: Home
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
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
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
                  placeholder="Search by name or village..."
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
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All States</SelectItem>
                      {states.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">District</Label>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Districts</SelectItem>
                      {selectedState && districts[selectedState as keyof typeof districts]?.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Claim Type</Label>
                  <Select value={selectedClaimType} onValueChange={setSelectedClaimType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select claim type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="IFR">Individual Forest Rights (IFR)</SelectItem>
                      <SelectItem value="CR">Community Rights (CR)</SelectItem>
                      <SelectItem value="CFR">Community Forest Resource (CFR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Map Layers</Label>
              <Tabs value={activeLayer} onValueChange={setActiveLayer} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="claims">Claims</TabsTrigger>
                  <TabsTrigger value="assets">Assets</TabsTrigger>
                </TabsList>
                <TabsContent value="claims" className="space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-fra-success"></div>
                        <span className="text-xs">Approved Claims</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mockFRAClaims.filter(c => c.status === 'Approved').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-fra-warning"></div>
                        <span className="text-xs">Pending Claims</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mockFRAClaims.filter(c => c.status === 'Pending').length}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="assets" className="space-y-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <TreePine className="w-3 h-3 text-fra-forest" />
                        <span className="text-xs">Forest Cover</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mockAssets.filter(a => a.type === 'forest_cover').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-3 h-3 text-fra-info" />
                        <span className="text-xs">Water Bodies</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {mockAssets.filter(a => a.type === 'water_body').length}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Claims ({filteredClaims.length})</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredClaims.map((claim) => (
                  <motion.div
                    key={claim.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group"
                  >
                    <Card className="p-3 hover:shadow-soft transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {claim.claimantName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {claim.village}, {claim.district}
                          </p>
                          <div className="mt-2 flex items-center space-x-2">
                            <Badge 
                              variant={claim.status === 'Approved' ? 'default' : claim.status === 'Pending' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {claim.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {claim.claimType}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{claim.area} ha</p>
                          <Button variant="ghost" size="sm" className="mt-1 h-6 w-6 p-0">
                            <Info className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapboxMap />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <Button variant="secondary" size="icon" className="bg-background/90 backdrop-blur">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="bg-background/90 backdrop-blur">
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Legend */}
          <Card className="absolute bottom-4 left-4 p-4 bg-background/90 backdrop-blur">
            <h4 className="text-sm font-medium mb-3">Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-fra-success"></div>
                <span className="text-xs">Approved Claims</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-fra-warning"></div>
                <span className="text-xs">Pending Claims</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-xs">Rejected Claims</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}