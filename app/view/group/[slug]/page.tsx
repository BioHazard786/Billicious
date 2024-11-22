import { fetchGroupData } from "@/app/group/[slug]/utils";
import Dashboard from "@/components/dashboard/dashboard";
import { DashboardStoreProvider } from "@/providers/dashboard-store-provider";
import React from "react";

const Page = async ({ params }: { params: { slug: string } }) => {
  const groupId = params.slug;
  const groupData = await fetchGroupData(groupId);
  return (
    <DashboardStoreProvider initialGroupData={groupData}>
      <Dashboard />
    </DashboardStoreProvider>
  );
};

export default Page;
