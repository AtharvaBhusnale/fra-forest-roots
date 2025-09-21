import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { FRAClaimData, AssetData } from "@/data/mockData";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  claims: FRAClaimData[];
  assets: AssetData[];
  selectedState: string;
  selectedDistrict: string;
  onClaimClick?: (claim: FRAClaimData) => void;
}

export default function LeafletMap({ claims, assets, selectedState, selectedDistrict, onClaimClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map centered on India
    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add satellite imagery option
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 18,
    });

    // Layer control
    const baseMaps = {
      "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }),
      "Satellite": satellite
    };

    L.control.layers(baseMaps).addTo(map);

    mapInstance.current = map;
    markersRef.current.addTo(map);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add claim markers
    claims.forEach((claim) => {
      const [lng, lat] = claim.coordinates;
      
      // Custom marker based on status
      const markerColor = claim.status === 'Approved' ? '#10B981' : 
                         claim.status === 'Pending' ? '#F59E0B' : '#EF4444';

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          background-color: ${markerColor};
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersRef.current);

      // Popup content
      const popupContent = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-base mb-2">${claim.claimantName}</h3>
          <div class="space-y-1 text-sm">
            <p><span class="font-medium">Village:</span> ${claim.village}</p>
            <p><span class="font-medium">District:</span> ${claim.district}</p>
            <p><span class="font-medium">Type:</span> ${claim.claimType}</p>
            <p><span class="font-medium">Area:</span> ${claim.area} ha</p>
            <p><span class="font-medium">Status:</span> 
              <span class="inline-flex px-2 py-1 text-xs rounded-full" style="
                background-color: ${markerColor}20; 
                color: ${markerColor};
              ">${claim.status}</span>
            </p>
          </div>
          <div class="mt-3 pt-2 border-t">
            <p class="text-xs font-medium text-gray-600">Eligible Schemes:</p>
            <div class="flex flex-wrap gap-1 mt-1">
              ${claim.eligibleSchemes.map(scheme => 
                `<span class="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${scheme}</span>`
              ).join('')}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { 
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Click handler
      marker.on('click', () => {
        if (onClaimClick) {
          onClaimClick(claim);
        }
      });
    });

    // Add asset markers with different icons
    assets.forEach((asset) => {
      const [lng, lat] = asset.coordinates;
      
      const assetIcons = {
        water_body: '💧',
        forest_cover: '🌲',
        homestead: '🏠',
        agricultural_land: '🌾'
      };

      const assetColors = {
        water_body: '#3B82F6',
        forest_cover: '#10B981',
        homestead: '#8B5CF6',
        agricultural_land: '#F59E0B'
      };

      const customIcon = L.divIcon({
        className: 'asset-marker',
        html: `<div style="
          background-color: ${assetColors[asset.type]};
          width: 8px;
          height: 8px;
          border-radius: 2px;
          border: 1px solid white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        "></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(markersRef.current);

      const popupContent = `
        <div class="p-2">
          <h4 class="font-medium text-sm mb-1">${asset.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
          <div class="text-xs space-y-1">
            <p><span class="font-medium">Area:</span> ${asset.area} ha</p>
            <p><span class="font-medium">Confidence:</span> ${(asset.confidence * 100).toFixed(0)}%</p>
            <p><span class="font-medium">Last Updated:</span> ${new Date(asset.lastUpdated).toLocaleDateString()}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { 
        maxWidth: 200,
        className: 'asset-popup'
      });
    });

    // Fit map to show all markers if we have claims
    if (claims.length > 0) {
      const group = new L.FeatureGroup(markersRef.current.getLayers());
      const bounds = group.getBounds();
      if (bounds.isValid()) {
        mapInstance.current.fitBounds(bounds, { padding: [20, 20] });
      }
    }

  }, [claims, assets, onClaimClick]);

  // Focus map on selected state/district
  useEffect(() => {
    if (!mapInstance.current) return;

    const stateCoordinates: Record<string, [number, number]> = {
      "Madhya Pradesh": [23.4734, 77.9476],
      "Tripura": [23.9408, 91.9882],
      "Odisha": [20.9517, 85.0985],
      "Telangana": [18.1124, 79.0193]
    };

    if (selectedState && stateCoordinates[selectedState]) {
      const [lat, lng] = stateCoordinates[selectedState];
      mapInstance.current.setView([lat, lng], 7, { animate: true });
    }
  }, [selectedState, selectedDistrict]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Legend */}
      <Card className="absolute bottom-4 left-4 p-4 bg-background/95 backdrop-blur shadow-medium">
        <h4 className="text-sm font-medium mb-3">Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-fra-success border border-white shadow-sm"></div>
            <span className="text-xs">Approved Claims</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-fra-warning border border-white shadow-sm"></div>
            <span className="text-xs">Pending Claims</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-destructive border border-white shadow-sm"></div>
            <span className="text-xs">Rejected Claims</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded bg-fra-info border border-white shadow-sm"></div>
              <span className="text-xs">Water Bodies</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded bg-fra-success border border-white shadow-sm"></div>
              <span className="text-xs">Forest Cover</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Map attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Powered by Leaflet & OpenStreetMap
      </div>

      {/* Custom styles for popups */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .asset-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.4;
        }
        .leaflet-control-layers {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .leaflet-control-zoom {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .leaflet-control-zoom a {
          border-radius: 0;
          font-size: 16px;
          line-height: 30px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}