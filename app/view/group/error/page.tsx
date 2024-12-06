import NotFound from "@/components/error/not-found";
import React from "react";

const Page = () => {
  return (
    <NotFound
      customTitle="Group No Longer Available"
      customMessage="This group has just been deleted."
    />
  );
};

export default Page;
