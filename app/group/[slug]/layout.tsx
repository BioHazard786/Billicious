import NotAllowed from "@/components/error/not-allowed";
import BottomNavbar from "@/components/layouts/bottom-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import { getUser } from "@/server/actions";
import { fetchGroupData, isMemberInGroup } from "./utils";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const groupId = params.slug;
  const user = await getUser();

  const memberStatus = await isMemberInGroup(user?.id, groupId);
  if (memberStatus === 0 || memberStatus === 1) {
    return <NotAllowed groupId={groupId} memberStatus={memberStatus} />;
  }

  const groupData = await fetchGroupData(groupId);

  return (
    <section>
      <DashboardStoreProvider initialGroupData={groupData}>
        <BottomNavbar />
        <SideNavbar />
        {children}
      </DashboardStoreProvider>
    </section>
  );
}
