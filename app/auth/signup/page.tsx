import SignUp from "@/components/auth/sign-up";
import { cookies } from "next/headers";
import React from "react";

const Page = () => {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;
  return (
    <div className="mt-16 flex h-dvh w-full items-center justify-center">
      <SignUp lastSignedInMethod={lastSignedInMethod} />
    </div>
  );
};

export default Page;
