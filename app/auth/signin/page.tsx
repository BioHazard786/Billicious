import SignIn from "@/components/auth/sign-in";
import { cookies } from "next/headers";

const Page = () => {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;
  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <SignIn lastSignedInMethod={lastSignedInMethod} />
    </div>
  );
};

export default Page;
