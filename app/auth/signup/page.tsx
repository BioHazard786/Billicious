import SignUp from "@/components/auth/sign-up";
import { cookies } from "next/headers";
import React from "react";

const Page = () => {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;
  return (
    <div className="grid min-h-screen place-items-center pt-16">
      <SignUp lastSignedInMethod={lastSignedInMethod} />
    </div>
  );
};

export default Page;
