import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardShell from "./DashboardShell";
import ModalProvider from "@/components/model-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  console.log("🔐 Dashboard Layout Auth Check:", {
    hasToken: !!accessToken,
    tokenPreview: accessToken ? accessToken.substring(0, 20) + "..." : "none",
  });

  if (!accessToken) {
    console.log("❌ No access token found, redirecting to login");
    redirect("/login");
  }

  return (
    <DashboardShell>
      {children}
      <ModalProvider />
    </DashboardShell>
  );
}
