export type SignalStatus = "active" | "resolved";

export interface EmergencySignal {
  id: string;
  uid: string;
  username: string;
  message?: string;
  /** Bilgilendirilecek arkadaş UID'leri */
  notifyUids: string[];
  status: SignalStatus;
  createdAt: string;
}
