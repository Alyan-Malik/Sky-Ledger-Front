import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Errors {
  first_name?: string[];
  last_name?: string[];
  email?: string[];
  phone?: string[];
  password?: string[];
  general?: string;
}

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — SkyLedger" },
      { name: "description", content: "Create your free SkyLedger flight booking management account." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  // State Management
  const [showPw, setShowPw] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: ""
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user starts typing
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Calling the AuthContext register method with updated keys
      await register(formData);
      setIsSuccess(true);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isSuccess ? (
        <motion.div
          key="register-form"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
        >
          <AuthShell
            title="Create your account"
            subtitle="Start managing flights in minutes — no credit card required."
            footer={
              <>
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Login
                </Link>
              </>
            }
          >
            {errors.general && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm">
                {errors.general}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    placeholder="Ahmed"
                    className={`h-11 ${errors.first_name ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.first_name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.first_name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    placeholder="Raza"
                    className={`h-11 ${errors.last_name ? 'border-red-500 ring-red-500' : ''}`}
                  />
                  {errors.last_name && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.last_name[0]}</p>}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@agency.com"
                  className={`h-11 ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.email[0]}</p>}
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+92 300 1234567"
                  className={`h-11 ${errors.phone ? 'border-red-500 ring-red-500' : ''}`}
                />
                {errors.phone && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.phone[0]}</p>}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPw ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className={`h-11 pr-10 ${errors.password ? 'border-red-500 ring-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-[10px] uppercase font-bold tracking-wider mt-1">{errors.password[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm</Label>
                  <Input
                    id="confirm"
                    name="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="h-11"
                  />
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox id="terms" className="mt-0.5" required />
                <span>
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 size={16} className="animate-spin mr-2" />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </AuthShell>
        </motion.div>
      ) : (
        /* SUCCESS STATE: Verify Email View aligned with original design */
        <motion.div
          key="success-message"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="w-full text-center" // Centering applied here handles the title if AuthShell inherits text alignment
        >
          <AuthShell
            title="Verify your email"
            subtitle=""
            footer={
              <div className="flex justify-center w-full text-center">
                <p className="text-xs text-muted-foreground">
                  Did not receive the email?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Try again through login
                  </Link>
                </p>
              </div>
            }
          >
            <div className="text-center py-4">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
              </div>

              <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                Success! We've sent a verification link to <br />
                <span className="text-foreground font-semibold">{formData.email}</span>. <br />
                Please check your inbox (and spam folder) to activate your account.
              </p>

              <Button asChild size="lg" className="w-full">
                <Link to="/login">Continue to Sign In</Link>
              </Button>
            </div>
          </AuthShell>
        </motion.div>

      )}
    </AnimatePresence>
  );
}