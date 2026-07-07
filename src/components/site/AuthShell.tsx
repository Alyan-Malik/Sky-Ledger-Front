import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/common/Brand";
import heroImg from "@/assets/hero.jpg";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f38]/90 to-primary/70" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Brand invert />
          <div>
            <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
              Manage flights the smarter way.
            </h2>
            <ul className="mt-6 space-y-3">
              {[
                "Search fares across 50+ airlines",
                "Track bookings, PNRs and payments",
                "Print airline-grade e-tickets instantly",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="h-5 w-5 text-white" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-white/60">© {new Date().getFullYear()} SkyLedger</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}