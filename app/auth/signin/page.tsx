import SignIn from "@/components/auth/sign-in";
import { cookies } from "next/headers";

const Page = () => {
  const cookieJar = cookies();
  const lastSignedInMethod = cookieJar.get("lastSignedInMethod")?.value;
  return (
    <div className="grid min-h-screen place-items-center pt-16">
      <SignIn lastSignedInMethod={lastSignedInMethod} />
    </div>
  );
};

export default Page;
