import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Lock, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "../api/axios";

interface ResetSearchParameters {
  email?: string;
}

export const Route = createFileRoute("/password-reset/$token")({
  validateSearch: (search: Record<string, unknown>): ResetSearchParameters => {
    return {
      email: search.email ? String(search.email) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Reset Password — SkyLedger" },
      { name: "description", content: "Set a new password for your SkyLedger account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useParams();
  const { email } = Route.useSearch();

  // App Functional States
  const [verifying, setVerifying] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  // Verify token authenticity on layout mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/check-reset-token/${token}`);
        setVerifying(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Invalid or expired token.");
        setVerifying(false);
      }
    };
    if (token) verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/reset-password", {
        token,
        email: email,
        ...formData,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm text-muted-foreground font-medium">Verifying reset token security status...</p>
      </div>
    );
  }

  return (
    <AuthShell
      title={success ? "Password Reset!" : "New Password"}
      subtitle={success ? "Your account has been secured." : "Set your new account password below."}
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {success ? (
        /* SUCCESS SCREEN VIEW */
        <div className="space-y-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You can now sign in with your new password credentials.
          </p>
          <Button asChild size="lg" className="w-full">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      ) : (
        /* PASSWORD UPDATE INPUT FORM */
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex gap-2 text-sm items-start">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Password field container */}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className="h-11 pl-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          {/* Confirm Password field container */}
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password_confirmation"
                type="password"
                required
                placeholder="••••••••"
                className="h-11 pl-10"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          {/* Execution action element */}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}