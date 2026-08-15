/**
 * ProtectedRoute.tsx — Guards protected routes with authentication check and setup redirect (Phase A5)
 */

import * as React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isSetupRequired } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-neutral-200">
        <Spinner className="h-8 w-8 text-primary-500" />
        <p className="text-sm text-neutral-400 font-medium animate-pulse">Loading ScriptureCast...</p>
      </div>
    );
  }

  if (isSetupRequired) {
    return <Redirect to="/setup" />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}
