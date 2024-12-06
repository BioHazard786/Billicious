import UpdatePassword from "@/components/auth/update-password";
import NotAllowed from "@/components/error/not-allowed";
import { getSession } from "@/server/actions";

const Page = async () => {
  const user = await getSession();
  const provider = user?.app_metadata.provider;

  if (provider !== "email")
    return (
      <div className="grid min-h-screen w-full place-items-center">
        <NotAllowed
          groupId="update-password"
          memberStatus={0}
          customTitle="Access Not Allowed"
          customMessage="You must sign through to update your password. Please sign up with an email account to continue."
        />
      </div>
    );

  return (
    <div className="grid min-h-screen w-full place-items-center">
      <UpdatePassword />
    </div>
  );
};

export default Page;
