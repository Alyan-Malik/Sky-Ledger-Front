import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import api from "../api/axios";

export const Route = createFileRoute("/verify-account/$token")({
  head: () => ({
    meta: [
      { title: "Verify Account — SkyLedger" },
      { name: "description", content: "Verify your SkyLedger account email." },
    ],
  }),
  component: VerifyAccountPage,
});

function VerifyAccountPage() {
  // 1. Grabs the dynamic string parameter /verify-account/:token directly from the URL
  const { token } = Route.useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // 2. Makes the backend network request using your axios instance
        const { data } = await api.get(`/verify-account/${token}`);
        setStatus("success");
        setMessage(data.message);
        
        // 3. Graceful auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed. Please try again.");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  // UI strings injected dynamically into your common AuthShell layout
  const shellConfig = {
    loading: {
      title: "Verifying account",
      subtitle: "Please wait while we confirm your credentials...",
      footer: null,
    },
    success: {
      title: "Account verified!",
      subtitle: "Your email has been successfully checked.",
      footer: (
        <span className="text-muted-foreground animate-pulse text-xs">
          Redirecting to login automatically...
        </span>
      ),
    },
    error: {
      title: "Verification failed",
      subtitle: "Something went wrong during your validation checks.",
      footer: (
        <>
          Need an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register here
          </Link>
        </>
      ),
    },
  };

   return (
    <div className="w-full text-center">
      <AuthShell
        title={shellConfig[status].title}
        subtitle={shellConfig[status].subtitle}
        footer={
          shellConfig[status].footer && (
            <div className="flex justify-center w-full text-center text-xs">
              {shellConfig[status].footer}
            </div>
          )
        }
      >
        <div className="text-center py-4 flex flex-col items-center justify-center w-full">
          
          {/* VIEW 1: LOADING STATE (Shows immediately on click) */}
          {status === "loading" && (
            <div className="space-y-4 py-4">
              <Loader2 size={40} className="animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Communicating securely with verification servers.</p>
            </div>
          )}

          {/* VIEW 2: SUCCESS STATE (Updates instantly when backend confirms 200 OK) */}
          {status === "success" && (
            <div className="space-y-6 w-full">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 mx-auto">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">
                {message || "Authentication credentials established successfully."}
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/login">Go to Login Now</Link>
              </Button>
            </div>
          )}

          {/* VIEW 3: ERROR STATE (Shows if backend returns an error structure) */}
          {status === "error" && (
            <div className="space-y-6 w-full">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 mx-auto">
                <XCircle size={36} className="text-destructive" />
              </div>
              <p className="text-sm text-destructive bg-destructive/5 p-3 rounded-lg border border-destructive/10">
                {message}
              </p>
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          )}

        </div>
      </AuthShell>
    </div>
  );

}