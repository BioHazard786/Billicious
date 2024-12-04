import HomePage from "@/components/createGroup/home-page";
import { db } from "@/database/dbConnect";
import { formatUserGroupsData } from "@/lib/utils";
import { UserGroupsDataStoreProvider } from "@/providers/user-groups-data-store-provider";
import { getSession } from "@/server/actions";
import { getUserGroupsFromDB } from "./api/(users)/utils";
// import { redpanda } from "@/database/kafka";

const Page = async () => {
  // const consumer = redpanda.consumer({ groupId: 'my-group-id' });
  // console.log("Consumer");
  // console.log(consumer);

  // const run = async () => {
  //   await consumer.connect()
  //   await consumer.subscribe({
  //     topic: "billicious",
  //     fromBeginning: true
  //   })
  //   await consumer.run({
  //     eachMessage: async ({topic, partition, message}: {topic:string, partition:number, message:any}) => {
  //       const topicInfo = `topic: ${topic} (${partition}|${message.offset})`
  //       const messageInfo = `key: ${message.key}, value: ${message.value}`
  //       console.log(`Message consumed: ${topicInfo}, ${messageInfo}`)
  //     },
  //   })
  // }

  // run().catch(console.error)

  // process.once("SIGINT", async () => {
  //   try {
  //     await consumer.disconnect()
  //     console.log("Consumer disconnected")
  //   } finally {
  //     process.kill(process.pid, "SIGINT")
  //   }
  // });

  const user = await getSession();

  const usersGroup = await db.transaction(async (transaction) => {
    return getUserGroupsFromDB(transaction, user!.id);
  });

  return (
    <UserGroupsDataStoreProvider userGroups={formatUserGroupsData(usersGroup)}>
      <HomePage />
    </UserGroupsDataStoreProvider>
  );
};

export default Page;
