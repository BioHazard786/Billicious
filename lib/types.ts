export type TGroupData = {
  id: string;
  name: string;
  totalBill: number;
  members: TMembers[];
};

export type TMembers = {
  memberBills: { [key: string]: number };
  expenses: number;
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
  addUser: (user: TMembers) => void;
  addBill: (bill: billState) => void;
  restoreUsers: (users: TMembers[]) => void;
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
