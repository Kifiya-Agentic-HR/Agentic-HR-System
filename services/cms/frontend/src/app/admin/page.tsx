"use client"

import Dashboard from "@/components/admin/admin_dashboard";
import withAuth  from "@/utils/with_auth";

function DashboardPage() {
  return (
    <div className="space-y-8">
      <h2 className="ml-6 mt-8 text-3xl font-bold text-[#364957] border-b-2 border-orange-500 pb-1">
        Dashboard Overview
      </h2>
      <Dashboard />
    </div>
  );
}

const ProtectedAdminDashboard = withAuth(DashboardPage, ["admin"]);
export default ProtectedAdminDashboard;

//export default withAuth(DashboardPage, ["admin"]);