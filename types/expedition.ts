export type MissionStatus = 'PREPARING' | 'ENROUTE' | 'AT_DESTINATION' | 'RETURN' | 'EMERGENCY';

export interface Expedition {
  id: string;
  name: string;
  coords: string;
  lat: number;
  lng: number;
  desc: string;
  status: MissionStatus;
  overview: {
    dest: string;
    window: string;
    route: string;
    hub: string;
  };
  environment: {
    desc: string;
    dayTemp: string;
    dayWidth: string;
    nightTemp: string;
    nightWidth: string;
  };
  weight: {
    porter: number;
    personal: number;
    porterWidth: string;
    personalWidth: string;
  };
  financials: { category: string; amount: string }[];
  total: string;
  mapOffset?: { x: string; y: string };
  path?: { lat: number; lng: number }[];
}

export interface TravelerInfo {
  fullName: string;
  passportNumber: string;
  emergencyContact: string;
  bloodGroup: string;
  medicalConditions: string;
  gearCheck: boolean;
  insurancePolicy: string;
  startDate: string;
  endDate: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  lat: number;
  lng: number;
  alt: number;
  speed: number;
  hr: number;
  battery: number;
  status: 'active' | 'resting' | 'stationary' | 'emergency';
  updatedAt?: any;
  isUser?: boolean;
  travelerInfo?: TravelerInfo;
}
