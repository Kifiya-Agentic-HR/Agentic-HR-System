import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import HRDashboard from "@/pages/hr/dashboard";
import HRJobPost from "@/pages/hr/job-post";
import HRSettings from "@/pages/hr/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSettings from "@/pages/admin/settings";
import HRJobApplications from "@/pages/hr/HRJobApplications"; // Import the new component

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/hr/dashboard" component={HRDashboard} />
      <ProtectedRoute path="/hr/job-post" component={HRJobPost} />
      <ProtectedRoute path="/hr/settings" component={HRSettings} />
      <ProtectedRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      <ProtectedRoute
        path="/hr/jobs/:jobId/applications"
        component={HRJobApplications}
      />{" "}
      {/* Add the new route */}
      <Route path="/" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="hr-dashboard-theme">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
