type GroupData = {
  name: string;
  members: string[];
};

type MemberData = {
  group_id: string;
  members: string[];
};

type BillData = {
  group_id: string;
  name: string;
  category: string;
  created_at?: number;
  notes?: string;
  drawees: { [key: string]: number };
  payees: { [key: string]: number };
};

type ProfileData = {
  userId: string;
  name: string;
  username: string;
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
