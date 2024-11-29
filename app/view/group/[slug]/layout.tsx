import { fetchGroupData } from "@/app/group/[slug]/utils";
import BottomNavbar from "@/components/layouts/bottom-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const groupId = params.slug;
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
