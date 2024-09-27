import {
  getGroupBillsFromDB,
  getGroupFromDB,
  getMembersFromDB,
} from "@/app/api/(groups)/utils";
import FloatingNavbar from "@/components/layouts/floating-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { formatGroupData } from "@/lib/utils";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";

export default async function DashboardLayout({
  children, // will be a page or nested layout
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const groupId = params.slug;
  const data: any = {};
  [data.group, data.users, data.bills] = await Promise.all([
    getGroupFromDB({ group_id: groupId }),
    getMembersFromDB({ group_id: groupId }),
    getGroupBillsFromDB({ group_id: groupId, page_size: 9 }),
  ]);

  const groupData = formatGroupData(data);
  return (
    <section>
      <DashboardStoreProvider initialGroupData={groupData}>
        <FloatingNavbar />
        <SideNavbar />
        {children}
      </DashboardStoreProvider>
    </section>
  );
}
