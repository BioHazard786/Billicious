import { fetchGroupData, isMemberInGroup } from "@/app/group/[slug]/utils";
import Realtime from "@/components/dashboard/realtime";
import BottomNavbar from "@/components/layouts/bottom-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import { getSession } from "@/server/actions";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const groupId = params.slug;
  const user = await getSession();

  const memberStatus = await isMemberInGroup(user?.id, groupId);
  if (memberStatus === 2) {
    return redirect(`/group/${encodeURIComponent(groupId)}`);
  }
  const groupData = await fetchGroupData(groupId);

  return (
    <section>
      <DashboardStoreProvider initialGroupData={groupData}>
        <Realtime />
        <BottomNavbar removeBillForm={true} />
        <SideNavbar removeBillForm={true} />
        {children}
      </DashboardStoreProvider>
    </section>
  );
}
