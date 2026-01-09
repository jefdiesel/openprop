import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user has admin privileges
  const hasAdminAccess = await isUserAdmin(session.user.id);

  if (!hasAdminAccess) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, subscriptions, and system-wide settings.
        </p>
      </div>

      {/* Admin Dashboard Content */}
      <AdminDashboard />
    </div>
  );
}
