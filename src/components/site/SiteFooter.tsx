import { Mail, MapPin, Phone } from "lucide-react";
import { Brand } from "@/components/common/Brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Simplified clean row layout for brand and contact details */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <Brand />
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The all-in-one flight booking management platform built for modern travel agencies.
            </p>
          </div>

          {/* Contact Group structured as a tight inline horizontal display on wider viewports */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6 md:mt-2">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> +92 300 1234567
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> hello@skyledger.app
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Karachi, Pakistan
            </span>
          </div>
        </div>

        {/* Bottom copyright line with reduced top margin */}
        <div className="mt-6 border-t border-border pt-4 text-center md:text-left">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} SkyLedger. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}