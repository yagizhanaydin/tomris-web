export type FriendshipStatus = "pending" | "accepted" | "rejected";

export interface Friendship {
  id: string;
  fromUid: string;
  toUid: string;
  fromUsername: string;
  toUsername: string;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Block {
  id: string;
  blockerUid: string;
  blockedUid: string;
  blockedUsername: string;
  createdAt: string;
}

export interface FriendProfile {
  uid: string;
  username: string;
}
