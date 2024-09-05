export type TGroupData = {
  id: string;
  name: string;
  totalBill: number;
  members: TMembers[];
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

export type DashboardAction = {
  addBill: (bill: TBill) => void;
  addMember: (member: TMembers[]) => void;
};

export type TransactionT = {
  _id?: string;
  groupId: string;
  amount: number;
  transactionName: string;
  notes?: string;
  drawees: { draweeId: string; draweeName: string }[];
  payees: { [key: string]: number };
  creationDate: Date;
};
