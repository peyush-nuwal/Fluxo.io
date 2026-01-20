import Topbar from "@/components/topbar";
import DashboardShell from "../DashboardShell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <Topbar />
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    </DashboardShell>
  );
}
