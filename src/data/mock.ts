export interface Airline {
  code: string;
  name: string;
  color: string; // hsl/hex badge background
}

export const airlines: Airline[] = [
  { code: "EK", name: "Emirates", color: "#d71a21" },
  { code: "QR", name: "Qatar Airways", color: "#5c0632" },
  { code: "TK", name: "Turkish Airlines", color: "#c8102e" },
  { code: "PK", name: "Pakistan Intl", color: "#00614f" },
  { code: "SV", name: "Saudia", color: "#00754a" },
  { code: "EY", name: "Etihad Airways", color: "#bd8b13" },
  { code: "MH", name: "Malaysia Airlines", color: "#00559a" },
];

export interface Flight {
  id: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  fromCity: string;
  to: string;
  toCity: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  cabin: string;
  price: number;
  serviceCharge: number;
}

export const flights: Flight[] = [
  {
    id: "FL-1001",
    airlineCode: "EK",
    flightNumber: "EK-602",
    from: "KHI",
    fromCity: "Karachi",
    to: "DXB",
    toCity: "Dubai",
    departTime: "09:00",
    arriveTime: "11:15",
    duration: "2h 15m",
    stops: 0,
    cabin: "Economy",
    price: 82500,
    serviceCharge: 2500,
  },
  {
    id: "FL-1002",
    airlineCode: "QR",
    flightNumber: "QR-605",
    from: "KHI",
    fromCity: "Karachi",
    to: "DXB",
    toCity: "Dubai",
    departTime: "13:40",
    arriveTime: "18:05",
    duration: "4h 25m",
    stops: 1,
    cabin: "Economy",
    price: 74300,
    serviceCharge: 2500,
  },
  {
    id: "FL-1003",
    airlineCode: "TK",
    flightNumber: "TK-709",
    from: "KHI",
    fromCity: "Karachi",
    to: "DXB",
    toCity: "Dubai",
    departTime: "22:10",
    arriveTime: "00:35",
    duration: "2h 25m",
    stops: 0,
    cabin: "Business",
    price: 168000,
    serviceCharge: 4000,
  },
  {
    id: "FL-1004",
    airlineCode: "PK",
    flightNumber: "PK-213",
    from: "KHI",
    fromCity: "Karachi",
    to: "DXB",
    toCity: "Dubai",
    departTime: "06:30",
    arriveTime: "08:50",
    duration: "2h 20m",
    stops: 0,
    cabin: "Economy",
    price: 69900,
    serviceCharge: 2000,
  },
  {
    id: "FL-1005",
    airlineCode: "SV",
    flightNumber: "SV-731",
    from: "KHI",
    fromCity: "Karachi",
    to: "DXB",
    toCity: "Dubai",
    departTime: "16:20",
    arriveTime: "20:40",
    duration: "4h 20m",
    stops: 1,
    cabin: "Economy",
    price: 71800,
    serviceCharge: 2500,
  },
  {
    id: "FL-1006",
    airlineCode: "EY",
    flightNumber: "EY-398",
    from: "KHI",
    fromCity: "Karachi",
    to: "DXB",
    toCity: "Dubai",
    departTime: "19:05",
    arriveTime: "21:20",
    duration: "2h 15m",
    stops: 0,
    cabin: "Premium Economy",
    price: 98500,
    serviceCharge: 3000,
  },
];

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

export interface Booking {
  id: string;
  passenger: string;
  airlineCode: string;
  flightNumber: string;
  pnr: string;
  route: string;
  date: string;
  status: BookingStatus;
  amount: number;
}

export const bookings: Booking[] = [
  { id: "BK-24817", passenger: "Ahmed Raza", airlineCode: "EK", flightNumber: "EK-602", pnr: "X7K2LP", route: "KHI → DXB", date: "2026-07-04", status: "Confirmed", amount: 85000 },
  { id: "BK-24816", passenger: "Sara Malik", airlineCode: "TK", flightNumber: "TK-709", pnr: "M9QW21", route: "LHE → IST", date: "2026-07-03", status: "Pending", amount: 172000 },
  { id: "BK-24815", passenger: "Bilal Khan", airlineCode: "QR", flightNumber: "QR-605", pnr: "P3R8VZ", route: "KHI → DOH", date: "2026-07-02", status: "Confirmed", amount: 76800 },
  { id: "BK-24814", passenger: "Ayesha Noor", airlineCode: "SV", flightNumber: "SV-731", pnr: "K1L9MN", route: "KHI → JED", date: "2026-07-01", status: "Confirmed", amount: 74300 },
  { id: "BK-24813", passenger: "Usman Tariq", airlineCode: "PK", flightNumber: "PK-213", pnr: "B6C4TT", route: "ISB → DXB", date: "2026-06-30", status: "Cancelled", amount: 71900 },
  { id: "BK-24812", passenger: "Hina Aslam", airlineCode: "MH", flightNumber: "MH-521", pnr: "Z2X5QW", route: "KHI → KUL", date: "2026-06-29", status: "Confirmed", amount: 132400 },
  { id: "BK-24811", passenger: "Faisal Iqbal", airlineCode: "EY", flightNumber: "EY-398", pnr: "H8N3RD", route: "LHE → AUH", date: "2026-06-28", status: "Pending", amount: 101500 },
  { id: "BK-24810", passenger: "Zara Sheikh", airlineCode: "EK", flightNumber: "EK-620", pnr: "V4M7KL", route: "KHI → LHR", date: "2026-06-27", status: "Confirmed", amount: 198000 },
];

export const recentSearches = [
  { route: "Karachi → Dubai", when: "2 hours ago", pax: "1 Adult · Economy" },
  { route: "Lahore → Istanbul", when: "Yesterday", pax: "2 Adults · Business" },
  { route: "Islamabad → Jeddah", when: "2 days ago", pax: "1 Adult · Economy" },
  { route: "Karachi → Kuala Lumpur", when: "3 days ago", pax: "3 Adults · Economy" },
];

export const destinations = [
  { city: "Dubai", country: "United Arab Emirates", price: "PKR 82,500", img: "dubai" },
  { city: "Istanbul", country: "Türkiye", price: "PKR 96,300", img: "istanbul" },
  { city: "Kuala Lumpur", country: "Malaysia", price: "PKR 132,400", img: "kualalumpur" },
  { city: "London", country: "United Kingdom", price: "PKR 198,000", img: "london" },
  { city: "Jeddah", country: "Saudi Arabia", price: "PKR 74,300", img: "jeddah" },
];

export const testimonials = [
  {
    name: "Kamran Ali",
    role: "Travel Agency Owner, Karachi",
    quote:
      "SkyLedger replaced three tools we used to juggle. Booking, printing tickets, and tracking payments now take minutes, not hours.",
    initials: "KA",
  },
  {
    name: "Nadia Hussain",
    role: "Operations Manager, Al-Safar Travels",
    quote:
      "The printable itineraries look genuinely professional. Our clients think we built a custom airline portal.",
    initials: "NH",
  },
  {
    name: "Omar Farooq",
    role: "Founder, SkyRoute Tours",
    quote:
      "Search is fast, the dashboard is clean, and my staff learned it in a single afternoon. Exactly what a busy agency needs.",
    initials: "OF",
  },
];

export const currency = (n: number) => "PKR " + n.toLocaleString("en-PK");