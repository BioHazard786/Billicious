import {
  addUserInfoToMembers,
  getGroupBillsFromDB,
  getGroupFromDB,
  getMembersFromDB,
  getUserInfoForMembers,
} from "@/app/api/(groups)/utils";
import BottomNavbar from "@/components/layouts/bottom-navbar";
import SideNavbar from "@/components/layouts/side-navbar";
import { db } from "@/database/dbConnect";
import { formatGroupData } from "@/lib/utils";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import { ExtractTablesWithRelations } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";

async function fetchMembersData(
  transaction: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import("@/database/schema"),
    ExtractTablesWithRelations<typeof import("@/database/schema")>
  >,
  groupId: string,
) {
  const members = await getMembersFromDB(transaction, groupId);
  const allUserInfo = await getUserInfoForMembers(transaction, members);
  return await addUserInfoToMembers(transaction, members, allUserInfo);
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const groupId = params.slug;
  const [group, members, bills] = await db.transaction(async (transaction) => {
    return await Promise.all([
      getGroupFromDB(transaction, groupId),
      fetchMembersData(transaction, groupId),
      getGroupBillsFromDB(transaction, groupId, 9, 1),
    ]);
  });

  const groupData = formatGroupData({ group, members, bills });

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
