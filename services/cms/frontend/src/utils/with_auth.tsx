"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[] = []
) => {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("accessToken");
      const role = localStorage.getItem("userRole"); // Retrieve role from localStorage

      console.log("Stored token:", token);
      console.log("Stored user role:", role);

      if (!token || !role) {
        console.warn("No token or role found, redirecting to login.");
        router.push("/"); // Redirect to login if no token or role
        return;
      }

      if (!allowedRoles.includes(role)) {
        console.warn("User role not authorized, redirecting to unauthorized page.");
        router.push("/unauthorized"); // Redirect if role is not allowed
        return;
      }

      console.log("User is authenticated with role:", role);
      setIsAuthenticated(true);
      setLoading(false);
    }, []);

    if (loading) {
      return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
      return null; // Prevent unauthorized content from rendering
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
