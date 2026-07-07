export type SignalStatus = "active" | "resolved";

export interface SignalLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface EmergencySignal {
  id: string;
  uid: string;
  username: string;
  message?: string | null;
  location?: SignalLocation | null;
  /** Bilgilendirilecek arkadaş UID'leri */
  notifyUids: string[];
  status: SignalStatus;
  createdAt: string;
}
