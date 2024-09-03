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
  name: string;
};

export type TBills = {
  [id: string]: {
    amount: number;
    name: string;
    shared_amount: number;
  };
};

export type billState = {
  billId: string;
  billName: string;
  billAmount: number;
  usersWithBillAdded: TMembers[];
  sharedAmount: number;
};

export type DashboardAction = {
  addBill: (bill: billState) => void;
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
