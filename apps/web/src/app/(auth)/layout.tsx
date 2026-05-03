import { AuthLightTheme } from "@/components/auth-light-theme";

export default function authLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AuthLightTheme />
      {children}
    </div>
  );
}
