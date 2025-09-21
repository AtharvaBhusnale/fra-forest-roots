// Mock data for FRA Atlas application

export interface FRAClaimData {
  id: string;
  claimantName: string;
  village: string;
  district: string;
  state: string;
  claimType: 'IFR' | 'CR' | 'CFR';
  status: 'Approved' | 'Pending' | 'Rejected';
  area: number; // in hectares
  coordinates: [number, number];
  submissionDate: string;
  eligibleSchemes: string[];
}

export interface AssetData {
  id: string;
  type: 'water_body' | 'forest_cover' | 'homestead' | 'agricultural_land';
  coordinates: [number, number];
  area: number;
  confidence: number;
  lastUpdated: string;
}

export interface SchemeRecommendation {
  scheme: string;
  description: string;
  benefits: string;
  priority: 'High' | 'Medium' | 'Low';
  eligibilityCriteria: string[];
}

// Mock FRA Claims Data
export const mockFRAClaims: FRAClaimData[] = [
  {
    id: 'FRA001',
    claimantName: 'Ravi Kumar',
    village: 'Khandwa',
    district: 'Khandwa',
    state: 'Madhya Pradesh',
    claimType: 'IFR',
    status: 'Approved',
    area: 2.5,
    coordinates: [76.3569, 21.8245],
    submissionDate: '2023-01-15',
    eligibleSchemes: ['PM-KISAN', 'Jal Jeevan Mission']
  },
  {
    id: 'FRA002',
    claimantName: 'Meera Devi',
    village: 'Agartala',
    district: 'West Tripura',
    state: 'Tripura',
    claimType: 'CR',
    status: 'Pending',
    area: 5.2,
    coordinates: [91.2868, 23.8315],
    submissionDate: '2023-03-22',
    eligibleSchemes: ['MGNREGA', 'DAJGUA']
  },
  {
    id: 'FRA003',
    claimantName: 'Santosh Tribal',
    village: 'Bhubaneswar',
    district: 'Khordha',
    state: 'Odisha',
    claimType: 'CFR',
    status: 'Approved',
    area: 12.8,
    coordinates: [85.8245, 20.2961],
    submissionDate: '2023-02-10',
    eligibleSchemes: ['PM-KISAN', 'Jal Jeevan Mission', 'MGNREGA']
  },
  {
    id: 'FRA004',
    claimantName: 'Lakshmi Gond',
    village: 'Warangal',
    district: 'Warangal',
    state: 'Telangana',
    claimType: 'IFR',
    status: 'Approved',
    area: 1.8,
    coordinates: [79.5941, 17.9689],
    submissionDate: '2023-04-05',
    eligibleSchemes: ['PM-KISAN', 'DAJGUA']
  },
  {
    id: 'FRA005',
    claimantName: 'Tribal Community',
    village: 'Jabalpur',
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    claimType: 'CR',
    status: 'Pending',
    area: 8.5,
    coordinates: [79.9864, 23.1815],
    submissionDate: '2023-05-12',
    eligibleSchemes: ['MGNREGA', 'Jal Jeevan Mission']
  }
];

// Mock Asset Data
export const mockAssets: AssetData[] = [
  {
    id: 'ASSET001',
    type: 'water_body',
    coordinates: [76.3569, 21.8245],
    area: 0.5,
    confidence: 0.92,
    lastUpdated: '2023-06-01'
  },
  {
    id: 'ASSET002',
    type: 'forest_cover',
    coordinates: [91.2868, 23.8315],
    area: 15.3,
    confidence: 0.89,
    lastUpdated: '2023-06-01'
  },
  {
    id: 'ASSET003',
    type: 'homestead',
    coordinates: [85.8245, 20.2961],
    area: 0.2,
    confidence: 0.95,
    lastUpdated: '2023-06-01'
  },
  {
    id: 'ASSET004',
    type: 'agricultural_land',
    coordinates: [79.5941, 17.9689],
    area: 3.2,
    confidence: 0.88,
    lastUpdated: '2023-06-01'
  }
];

// Mock Scheme Recommendations
export const mockSchemeRecommendations: SchemeRecommendation[] = [
  {
    scheme: 'PM-KISAN',
    description: 'Direct income support scheme for farmers',
    benefits: 'Rs. 6,000 per year in three installments',
    priority: 'High',
    eligibilityCriteria: ['Small and marginal farmers', 'Land ownership documents required']
  },
  {
    scheme: 'Jal Jeevan Mission',
    description: 'Providing functional household tap connections',
    benefits: 'Clean drinking water supply to households',
    priority: 'High',
    eligibilityCriteria: ['Rural households', 'Areas with water scarcity']
  },
  {
    scheme: 'MGNREGA',
    description: 'Employment guarantee scheme for rural households',
    benefits: '100 days of guaranteed employment per year',
    priority: 'Medium',
    eligibilityCriteria: ['Rural households', 'Adult members willing to work']
  },
  {
    scheme: 'DAJGUA',
    description: 'Development of Particularly Vulnerable Tribal Groups',
    benefits: 'Comprehensive development package',
    priority: 'High',
    eligibilityCriteria: ['Particularly Vulnerable Tribal Groups', 'Remote tribal areas']
  }
];

// Mock Statistics
export const mockStats = {
  totalClaims: 15847,
  approvedClaims: 9523,
  pendingClaims: 4782,
  rejectedClaims: 1542,
  villagesCovered: 2341,
  assetsMapped: 45632,
  beneficiaries: 73421
};

// Mock Chart Data
export const claimsByStateData = [
  { state: 'Madhya Pradesh', approved: 3542, pending: 1823, rejected: 621 },
  { state: 'Tripura', approved: 2156, pending: 987, rejected: 234 },
  { state: 'Odisha', approved: 2876, pending: 1245, rejected: 432 },
  { state: 'Telangana', approved: 951, pending: 727, rejected: 255 }
];

export const assetTypeData = [
  { type: 'Forest Cover', count: 18543, percentage: 40.6 },
  { type: 'Agricultural Land', count: 15234, percentage: 33.4 },
  { type: 'Water Bodies', count: 8765, percentage: 19.2 },
  { type: 'Homesteads', count: 3090, percentage: 6.8 }
];

export const monthlyProgressData = [
  { month: 'Jan', claims: 1234, assets: 2341 },
  { month: 'Feb', claims: 1456, assets: 2876 },
  { month: 'Mar', claims: 1789, assets: 3421 },
  { month: 'Apr', claims: 1623, assets: 3156 },
  { month: 'May', claims: 1934, assets: 3789 },
  { month: 'Jun', calls: 2145, assets: 4234 }
];