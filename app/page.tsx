import CreateGroupForm from "@/components/createGroup/create-group-form";
// import { redpanda } from "@/database/kafka";

const Page = () => {

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

  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <CreateGroupForm />
    </div>
  );
};

export default Page;
