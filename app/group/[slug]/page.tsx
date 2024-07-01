import Dashboard from "@/components/dashboard/dashboard";
import FloatingNavbar from "@/components/layouts/floating-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import { fetchGroupById } from "@/server/actions";

const Page = async ({ params }: { params: { slug: string } }) => {
  const groupId = params.slug;
  const groupData = await fetchGroupById(groupId);

  return (
    <DashboardStoreProvider initialGroupData={JSON.parse(groupData as string)}>
      <SideNavbar />
      <FloatingNavbar />
      <Dashboard
        initialGroupMembers={JSON.parse(groupData as string).members}
      />
    </DashboardStoreProvider>
  );
};

export default Page;
