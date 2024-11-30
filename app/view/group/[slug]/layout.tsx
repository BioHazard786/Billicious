import { fetchGroupData, isMemberInGroup } from "@/app/group/[slug]/utils";
import BottomNavbar from "@/components/layouts/bottom-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import { getUser } from "@/server/actions";
import { redirect } from "next/navigation";

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
  if (memberStatus === 2) {
    return redirect(`/group/${encodeURIComponent(groupId)}`);
  }
  const groupData = await fetchGroupData(groupId);

  return (
    <section>
      <DashboardStoreProvider initialGroupData={groupData}>
        <BottomNavbar removeBillForm={true} />
        <SideNavbar removeBillForm={true} />
        {children}
      </DashboardStoreProvider>
    </section>
  );
}
