type GroupData = {
  name: string;
  members: string[];
  usernames: string[];
  ownerId: string;
  currencyCode: string;
  backgroundUrl?: string;
};

type MemberData = {
  name?: string;
  groupId: string;
  members?: string[];
  usernames?: string[];
  userId: string;
};

type BillData = {
  groupId: string;
  name: string;
  category: string;
  createdBy: number;
  createdAt?: Date;
  isPayment?: boolean;
  notes?: string;
  drawees: { [key: string]: number };
  payees: { [key: string]: number };
};

type ProfileData = {
  email: string;
  userId: string;
  name: string;
  username: string;
};

type InviteData = {
  groupId: string | null;
  userId: string | null;
};

type DeleteInviteData = {
  groupId: string | null;
  userId: string | null;
  userIndex: number | null;
};

type SendInviteData = {
  name?: string;
  groupId: string;
  senderUserId: string;
  receiverUsername: string;
  userIndex: number;
};

type CreateAdminData = {
  groupId: string;
  ownerId: string | undefined;
  userIndex: number;
};

type BillCategoryData = {
  groupId: string;
  from?: Date;
  to?: Date;
};

type TransactionData = {
  groupId: string;
  page: number;
  pageSize?: number;
  from?: Date;
  to?: Date;
};

const postFetchHelper = async (endPoint: string, body: string) => {
  const response = await fetch(endPoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error!.error || "Something went wrong");
  }

  const data = await response.json();
  return data;
};

export const createGroupInDB = async (groupData: GroupData) => {
  return postFetchHelper("/api/create_group", JSON.stringify(groupData));
};

export const viewGroup = async (groupId: string) => {
  return postFetchHelper(
    "/api/view_group",
    JSON.stringify({
      groupId,
    }),
  );
};

export const fetchUserGroupInfo = async ({
  userId,
  groupId,
}: {
  userId: string;
  groupId: string;
}) => {
  return postFetchHelper(
    "/api/get_user_group_info",
    JSON.stringify({ userId, groupId }),
  );
};

export const addMembersToGroupInDB = async (memberData: MemberData) => {
  return postFetchHelper("/api/add_members", JSON.stringify(memberData));
};

export const addBillToGroupInDB = async (billData: BillData) => {
  return postFetchHelper("/api/create_bill", JSON.stringify(billData));
};

export const updateProfile = async (profileData: ProfileData) => {
  return postFetchHelper("/api/update_profile", JSON.stringify(profileData));
};

export const searchUsername = async (username: string) => {
  return postFetchHelper("/api/search_username", JSON.stringify({ username }));
};

export const sendInvite = async (sendInviteData: SendInviteData) => {
  return postFetchHelper("/api/send_invite", JSON.stringify(sendInviteData));
};

export const acceptInvite = async (acceptInviteData: InviteData) => {
  return postFetchHelper(
    "/api/accept_invite",
    JSON.stringify(acceptInviteData),
  );
};

export const declineInvite = async (declineInviteData: DeleteInviteData) => {
  return postFetchHelper(
    "/api/delete_invite",
    JSON.stringify(declineInviteData),
  );
};

export const fetchAllBalances = async (groupId: string) => {
  return postFetchHelper("/api/get_all_balances", JSON.stringify({ groupId }));
};

export const fetchTransactions = async (transactionData: TransactionData) => {
  return postFetchHelper("/api/get_all_bills", JSON.stringify(transactionData));
};

export const fetchBillDetails = async (billId: string) => {
  return postFetchHelper("/api/view_bill", JSON.stringify({ billId }));
};

export const fetchBillCategories = async (
  billCategoryData: BillCategoryData,
) => {
  return postFetchHelper(
    "/api/view_bill/categories",
    JSON.stringify(billCategoryData),
  );
};

export const fetchBillTimeline = async (billCategoryData: BillCategoryData) => {
  return postFetchHelper(
    "/api/view_bill/timeline",
    JSON.stringify(billCategoryData),
  );
};

export const createAdmin = async (createAdminData: CreateAdminData) => {
  return postFetchHelper("/api/create_admin", JSON.stringify(createAdminData));
};

export const deleteAdmin = async (deleteAdminData: CreateAdminData) => {
  return postFetchHelper("/api/remove_admin", JSON.stringify(deleteAdminData));
};

export const deleteGroup = async (groupId: string) => {
  return postFetchHelper("/api/delete_group", JSON.stringify({ groupId }));
};

export const deleteBill = async (billId: string) => {
  return postFetchHelper("/api/delete_bill", JSON.stringify({ billId }));
};

export const fetchUserGroupsData = async (userId: string) => {
  return postFetchHelper("/api/get_all_groups", JSON.stringify({ userId }));
};
