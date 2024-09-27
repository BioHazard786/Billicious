export type TGroupData = {
  id: string;
  name: string;
  totalBill: number;
  members: TMembers[];
  transactions: TransactionT[];
};

export type TMembers = {
  totalPaid: number;
  balance: number;
  memberId: string;
  memberIndex: string;
  name: string;
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
  full_name: string;
  avatar_url?: string;
  email: string;
} | null;
