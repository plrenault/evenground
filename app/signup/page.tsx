import SignUpClient from "./SignUpClient";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return <SignUpClient token={searchParams.token ?? null} />;
}