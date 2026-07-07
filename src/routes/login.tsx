import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2, Send } from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SkyLedger" },
      { name: "description", content: "Log in to your SkyLedger flight booking management account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, resendVerification, isAuthenticated, loading: authLoading } = useAuth();

  // State Management
  const [showPw, setShowPw] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  const [showResend, setShowResend] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>( "");
  const [resending, setResending] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    remember: false
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError("");
    if (showResend) setShowResend(false);
  };

  const handleCheckedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, remember: checked }));
    if (error) setError("");
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    
    setResending(true);
    try {
      await resendVerification(unverifiedEmail);
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
        setShowResend(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setShowResend(false);

    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      const serverMessage = err.response?.data?.message;
      const status = err.response?.status;
      
      if (status === 403 && err.response?.data?.needs_verification) {
        setUnverifiedEmail(formData.email || err.response?.data?.email);
        setError(serverMessage || 'Account not verified. Please check your email.');
        setShowResend(true);
      } else if (status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(serverMessage || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your flights and bookings."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create account
          </Link>
        </>
      }
    >
      {/* Alert Notices & Resend Email Banner */}
      <AnimatePresence mode="wait">
        {(error || showResend) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-5 space-y-3"
          >
            {error && (
              <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                error.includes('verified') 
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400' 
                  : 'bg-destructive/10 border border-destructive/20 text-destructive'
              }`}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {showResend && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-left">
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                  Didn't receive the verification email? Click below to resend.
                </p>
                {resendSuccess ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Verification email sent successfully!
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-transparent flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              required 
              placeholder="you@agency.com" 
              className="h-11 pl-10" 
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="h-11 pl-10 pr-10"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle password"
              disabled={loading}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <Checkbox 
              id="remember" 
              checked={formData.remember} 
              onCheckedChange={handleCheckedChange}
              disabled={loading}
            /> 
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit Action */}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}