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
  createdAt?: number;
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

type SendInviteData = {
  name?: string;
  groupId: string;
  senderUserId: string;
  receiverUsername: string;
  userIndex: number;
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

export const declineInvite = async (declineInviteData: InviteData) => {
  return postFetchHelper(
    "/api/delete_invite",
    JSON.stringify(declineInviteData),
  );
};
