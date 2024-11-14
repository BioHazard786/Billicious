export type TGroupData = {
  id: string;
  name: string;
  totalBill: number;
  members: TMembers[];
  transactions: TransactionT[];
  currencyCode: string;
  backgroundUrl: string;
};

export type TMembers = {
  totalPaid: number;
  balance: number;
  memberId: string;
  memberIndex: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  isAdmin: boolean;
  status: number;
};

export type TBill = {
  totalAmount: number;
  updatedMembers: TMembers[];
};

export type TransactionT = {
  id: string;
  amount: number;
  name: string;
  notes?: string;
  category: string;
  isPayment: boolean;
  drawees: number[];
  payees: number[];
  createdAt: Date;
};

export type User = {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  email: string;
  has_passkey: boolean;
} | null;

export type userGroup = {
  groupId: string;
  userNameInGroup: string;
  balance: number;
  totalPaid: number;
  groupName: string;
  totalExpense: number;
  backgroundUrl: string;
  currencyCode: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Notifications = {
  notificationId: string;
  senderUserId: string | null;
  receiverUserId: string | null;
  groupId: string | null;
  userIndex: number | null;
  createdAt: Date;
  groupName: string | null;
  groupBackgroundUrl: string | null;
  senderName: string | null;
  senderAvatarUrl: string | null;
}[];

export type PermanentUser = {
  name: string;
  username: string;
  avatar_url?: string;
};
