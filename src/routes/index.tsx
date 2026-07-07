import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe2,
  Plane,
  Printer,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { destinations, testimonials } from "@/data/mock";
import heroImg from "@/assets/hero.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destIstanbul from "@/assets/dest-istanbul.jpg";
import destKl from "@/assets/dest-kualalumpur.jpg";
import destLondon from "@/assets/dest-london.jpg";
import destJeddah from "@/assets/dest-jeddah.jpg";

const destImages: Record<string, string> = {
  dubai: destDubai,
  istanbul: destIstanbul,
  kualalumpur: destKl,
  london: destLondon,
  jeddah: destJeddah,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkyLedger — Search Flights Faster & Smarter" },
      {
        name: "description",
        content:
          "SkyLedger is a premium flight booking management platform for travel agencies — fast flight search, secure booking management, and professional printable tickets.",
      },
      { property: "og:title", content: "SkyLedger — Search Flights Faster & Smarter" },
      {
        property: "og:description",
        content: "Premium flight booking management for modern travel agencies.",
      },
      { property: "og:image", content: heroImg },
    ],
  }),
  component: Index,
});

const features = [
  {
    icon: Search,
    title: "Fast Flight Search",
    desc: "Find the best fares across airlines in seconds with an intuitive, lightning-fast search experience.",
  },
  {
    icon: Globe2,
    title: "Multiple Airlines",
    desc: "Compare Emirates, Qatar, Turkish, Saudia and more — all from a single unified interface.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking Management",
    desc: "Track every booking, PNR and payment in one organised, reliable and secure dashboard.",
  },
  {
    icon: Printer,
    title: "Printable Tickets",
    desc: "Generate professional, airline-grade itineraries and e-tickets ready to print or email.",
  },
];

const whyUs = [
  { icon: Clock, title: "Save Hours Daily", desc: "Automate repetitive booking tasks and reclaim your team's time." },
  { icon: CreditCard, title: "Transparent Pricing", desc: "Clear fares, service charges and totals with zero surprises." },
  { icon: Ticket, title: "Agency-Grade Tickets", desc: "Branded, print-ready itineraries that impress your clients." },
  { icon: Sparkles, title: "Delightful UX", desc: "A clean, modern interface your staff will actually enjoy using." },
];

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Airplane wing above tropical islands"
            width={1536}
            height={1024}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f38]/85 via-[#0b1f38]/60 to-transparent" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" /> Trusted by modern travel agencies
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            Search Flights <span className="text-gradient">Faster &amp; Smarter</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
            The all-in-one platform to search flights, manage bookings, and print professional
            tickets — built for the way travel agencies really work.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/register">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg">
              <Link to="/login">Login</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/80">
            {["50+ airlines", "Instant e-tickets", "No credit card required"].map((t) => (
              <span key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Everything your agency needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            One elegant workspace for the entire flight booking lifecycle.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Why choose us
              </p>
              <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
                Built for busy travel professionals
              </h2>
              <p className="mt-4 text-muted-foreground">
                SkyLedger removes the busywork so your team can focus on delighting travellers.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {whyUs.map((w) => (
                  <div key={w.title} className="flex gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <w.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{w.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-border shadow-elevated">
                <img
                  src={heroImg}
                  alt="Travel destination"
                  loading="lazy"
                  width={1536}
                  height={1024}
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-2xl border border-border bg-card p-5 shadow-card sm:block">
                <div className="flex items-center gap-2 text-primary">
                  <Plane className="h-5 w-5 -rotate-45" />
                  <span className="text-sm font-semibold text-foreground">On-time rate</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-foreground">98.6%</p>
                <p className="text-xs text-muted-foreground">across managed bookings</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section id="destinations" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Popular destinations
            </p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              Where travellers are heading
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/register">Explore all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d, i) => (
            <div
              key={d.city}
              className={`group relative overflow-hidden rounded-2xl shadow-soft transition-shadow hover:shadow-card ${
                i === 0 ? "lg:col-span-2" : ""
              }`}
            >
              <img
                src={destImages[d.img]}
                alt={`${d.city}, ${d.country}`}
                loading="lazy"
                width={768}
                height={768}
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f38]/85 via-[#0b1f38]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <h3 className="text-xl font-bold text-white">{d.city}</h3>
                  <p className="text-sm text-white/80">{d.country}</p>
                </div>
                <div className="rounded-lg bg-white/15 px-3 py-1.5 text-right backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-wide text-white/70">from</p>
                  <p className="text-sm font-semibold text-white">{d.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Testimonials</p>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              Loved by travel agencies
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <Quote className="h-8 w-8 text-primary/30" />
                <div className="mt-2 flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">“{t.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-hero-gradient px-8 py-14 text-center shadow-elevated sm:px-14">
          <h2 className="mx-auto max-w-xl text-3xl font-bold text-white sm:text-4xl">
            Ready to streamline your bookings?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/85">
            Join hundreds of agencies managing flights the smarter way with SkyLedger.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="heroOutline" size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button asChild variant="heroOutline" size="lg">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
