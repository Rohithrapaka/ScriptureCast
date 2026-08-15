/**
 * login.tsx — ScriptureCast V2 Login Page (Phase A5)
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

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading, isSetupRequired, login } = useAuth();

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-neutral-200">
        <Spinner className="h-8 w-8 text-primary-500" />
        <p className="text-sm text-neutral-400 font-medium animate-pulse">Checking authentication status...</p>
      </div>
    );
  }

  if (isSetupRequired) {
    return <Redirect to="/setup" />;
  }

  if (isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      setLocation("/admin");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticationLayout title="ScriptureCast V2" subtitle="Sign in to Church Presentation Portal">
      <Card className="border-neutral-800 bg-neutral-900/90 backdrop-blur-md shadow-2xl">
        <CardHeader>
          <CardTitle>
            <Typography variant="h3">Sign In</Typography>
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the administration workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-md bg-danger-500/10 border border-danger-500/30 text-danger-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow label="Username or Email" required>
              <Input
                placeholder="admin or admin@church.org"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={submitting}
                autoFocus
              />
            </FormRow>

            <FormRow label="Password" required>
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
              />
            </FormRow>

            <Button type="submit" className="w-full mt-6" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthenticationLayout>
  );
}
