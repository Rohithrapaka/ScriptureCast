/**
 * setup.tsx — ScriptureCast V2 First-Time Setup Page (Phase A5)
 */

import * as React from "react";
import { useLocation, Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { AuthenticationLayout } from "@/components/layouts/AuthenticationLayout";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormRow } from "@/components/ui/form-row";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, isSetupRequired, checkSetupStatus, refreshSession } = useAuth();

  const [churchName, setChurchName] = React.useState("");
  const [adminName, setAdminName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-neutral-200">
        <Spinner className="h-8 w-8 text-primary-500" />
        <p className="text-sm text-neutral-400 font-medium animate-pulse">Checking system setup...</p>
      </div>
    );
  }

  if (!isSetupRequired && isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  if (!isSetupRequired && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!churchName.trim() || !username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          churchName: churchName.trim(),
          adminName: adminName.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete setup.");
      }

      await checkSetupStatus();
      await refreshSession();
      setLocation("/admin");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticationLayout title="Welcome to ScriptureCast" subtitle="First-Time Administrator Setup">
      <Card className="border-neutral-800 bg-neutral-900/90 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle>
            <Typography variant="h3">Initial Setup</Typography>
          </CardTitle>
          <CardDescription>
            Configure your church details and create the primary administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow label="Church Name" required>
              <Input
                placeholder="e.g. Grace Fellowship Church"
                value={churchName}
                onChange={(e) => setChurchName(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <FormRow label="Administrator Name">
              <Input
                placeholder="e.g. John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <FormRow label="Username" required helpText="At least 3 characters">
              <Input
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <FormRow label="Email Address" required>
              <Input
                type="email"
                placeholder="admin@church.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <FormRow label="Password" required helpText="At least 8 characters">
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <FormRow label="Confirm Password" required>
              <PasswordInput
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <Button type="submit" className="w-full mt-6" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Creating Administrator...
                </>
              ) : (
                "Complete Setup & Continue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthenticationLayout>
  );
}
