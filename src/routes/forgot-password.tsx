import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck, Loader2, AlertCircle, Mail } from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../context/AuthContext";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — SkyLedger" },
      { name: "description", content: "Reset your SkyLedger account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, isAuthenticated, loading: authLoading } = useAuth();
  
  // State Management
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email);
      setSent(true);
      setEmail(""); // Clear input on success
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                           err.response?.data?.errors?.email?.[0] || 
                           "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      {sent ? (
        /* SUCCESS SCREEN CASE */
        <div className="rounded-2xl border border-border bg-accent/10 p-6 text-center space-y-4">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
            <MailCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Check your inbox</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              We've sent a password reset link to your email address. Please follow the instructions to secure your credentials.
            </p>
          </div>
        </div>
      ) : (
        /* EMAIL SUBMISSION FORM */
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex gap-2 text-sm items-start">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                required 
                placeholder="you@agency.com" 
                className="h-11 pl-10"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}