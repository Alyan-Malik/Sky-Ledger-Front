import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Save, Loader2, KeyRound, Eye, EyeOff, X } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — SkyLedger" }] }),
  component: ProfilePage,
});

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input {...props} />
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();

  // Profile Form States
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const [fetchLoading, setFetchLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch explicit profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetchLoading(true);
        const response = await api.get("/user/profile");
        const data = response.data.profile;

        if (data) {
          setProfileData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            phone: data.phone || "",
            email: data.email || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Fallback to AuthContext values if API request encounters an issue
        if (user) {
          setProfileData({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone: user.phone || "",
            email: user.email || "",
          });
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const userInitials = `${profileData.first_name.charAt(0)}${profileData.last_name.charAt(0)}`.toUpperCase();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setGlobalMessage(null);

    try {
      const response = await api.post("/user/update-profile", {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
      });
      
      if (response.data.status === "success") {
        setGlobalMessage({ type: "success", text: response.data.message });
        const updatedData = response.data.profile;
        setProfileData((prev) => ({ ...prev, ...updatedData }));
      }
    } catch (err: any) {
      setGlobalMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile data.",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Full page skeleton screen state to handle background loads cleanly
  if (fetchLoading) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile details...</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and security settings."
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Profile" }]}
      />
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card Side Panel */}
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {userInitials || "AR"}
          </div>
          <p className="mt-4 font-semibold text-foreground">
            {profileData.first_name} {profileData.last_name}
          </p>
          <p className="text-sm text-muted-foreground">Agency Administrator</p>
          <section className="p-6">
           
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGlobalMessage(null);
                setIsPasswordModalOpen(true);
              }}
            >
              <KeyRound className="mr-2 h-4 w-4" /> Change Account Password
            </Button>
            <p className="text-sm text-muted-foreground mb-4 mt-2">
              Keep your password secure to safeguard your system records.
            </p>
          </section>
        </div>

        {/* Form Core Layout Workspace */}
        <div className="space-y-6 lg:col-span-2">
          {globalMessage && (
            <div
              className={cn(
                "p-3 border rounded-lg text-sm",
                globalMessage.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              )}
            >
              {globalMessage.text}
            </div>
          )}

          {/* Section: Personal Information */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 font-semibold text-foreground">Personal Information</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleProfileChange}
                  required
                />
                <Field
                  label="Last Name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleProfileChange}
                  required
                />
                <Field
                  label="Email (Read Only)"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                />
                <Field
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <Button type="submit" className="mt-4" disabled={profileLoading}>
                {profileLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Update Profile
              </Button>
            </form>
          </section>

          {/* Section: Security Toggle Panel */}
          {/* <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-2 font-semibold text-foreground">Account Security</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Keep your password secure to safeguard your system records.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setGlobalMessage(null);
                setIsPasswordModalOpen(true);
              }}
            >
              <KeyRound className="mr-2 h-4 w-4" /> Change Account Password
            </Button>
          </section> */}
        </div>
      </div>

      {/* Modal Wrapper Interface */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => setGlobalMessage({ type: "success", text: "Password updated successfully." })}
      />
    </>
  );
}

/* ==========================================================================
   PASSWORD CHANGE MODAL COMPONENT (UNCHANGED)
   ========================================================================== */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function PasswordChangeModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError("New password and confirmation do not match");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      await api.post("/user/change-password", passwordData);
      onSuccess();
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>

            <h3 className="text-lg font-semibold text-foreground mb-1">Update Password</h3>
            <p className="text-sm text-muted-foreground mb-4">Ensure your new password contains at least 8 characters.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    name="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    name="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password_confirmation">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="new_password_confirmation"
                    name="new_password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.new_password_confirmation}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Password
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}