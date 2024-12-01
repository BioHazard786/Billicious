"use server";

import { tenant } from "@teamhanko/passkeys-sdk";
import { getSession } from "./actions";

const passkeyApi = tenant({
  apiKey: process.env.PASSKEYS_API_KEY!,
  tenantId: process.env.PASSKEYS_TENANT_ID!,
});

export async function startServerPasskeyRegistration() {
  const sessionUser = await getSession();
  if (!sessionUser) return { error: "Not signed in" };
  const createOptions = await passkeyApi.registration.initialize({
    userId: sessionUser!.id,
    username: sessionUser!.email || "",
  });

  return createOptions;
}

export async function finishServerPasskeyRegistration(credential: any) {
  const session = await getSession();
  if (!session) return { error: "Not signed in" };
  await passkeyApi.registration.finalize(credential);
}

export async function startServerPasskeyLogin() {
  const options = await passkeyApi.login.initialize();
  return options;
}

export async function finishServerPasskeyLogin(options: any) {
  const response = await passkeyApi.login.finalize(options);
  return response;
}

export async function getSavedPasskeys(userId: string) {
  const passkeys = await passkeyApi.user(userId).credentials();
  return passkeys;
}
