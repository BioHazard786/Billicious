import Dashboard from "@/components/dashboard/dashboard";
import FloatingNavbar from "@/components/layouts/floating-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
// import { fetchGroupById } from "@/server/actions";

const Page = async ({ params }: { params: { slug: string } }) => {
  const groupId = params.slug;
  // const groupData = await fetchGroupById(groupId);
  const groupData = {
    id: "213sdf2w3",
    name: "Trip to LA",
    totalBill: 0,
    members: [
      { name: "Raunit", memberId: "random0", expenses: 0, memberBills: {} },
      { name: "Keshav", memberId: "random1", expenses: 0, memberBills: {} },
      { name: "Zaid", memberId: "random2", expenses: 0, memberBills: {} },
      { name: "Satyam", memberId: "random3", expenses: 0, memberBills: {} },
    ],
  };

  return (
    <DashboardStoreProvider initialGroupData={groupData}>
      <SideNavbar />
      <FloatingNavbar />
      <Dashboard initialGroupMembers={groupData.members} />
    </DashboardStoreProvider>
  );
};

export default Page;
