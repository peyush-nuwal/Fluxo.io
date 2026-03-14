import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DiagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = (await cookies()).get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}
