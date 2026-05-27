// ============================================================
// src/app/page.tsx — Landing Page (root route "/")
// ============================================================

"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { MapPin, Sparkles, DollarSign, Hotel, Luggage, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Itinerary Generation",
    desc: "Claude AI builds a personalized day-by-day plan based on your interests and budget.",
  },
  {
    icon: DollarSign,
    title: "Smart Budget Estimates",
    desc: "Get realistic cost breakdowns for flights, hotels, food, and activities.",
  },
  {
    icon: Hotel,
    title: "Hotel Suggestions",
    desc: "Curated hotel picks across budget, mid-range, and luxury for your destination.",
  },
  {
    icon: Luggage,
    title: "Smart Packing List",
    desc: "AI-generated packing list tailored to your destination, season, and activities.",
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen bg-gray-950">
      {/* ── Navigation ── */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <MapPin className="text-orange-500" size={24} />
          <span className="font-display text-xl font-bold text-white">TripAI</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                Log In
              </Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-2 mb-8">
          <Sparkles size={14} className="text-orange-400" />
          <span className="text-sm text-orange-300 font-medium">Powered by Gemini AI</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Plan your dream trip{" "}
          <span className="gradient-text">in seconds</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Tell us where you want to go and what you love. Our AI builds a complete
          itinerary, budget plan, hotel picks, and packing list — instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={isAuthenticated ? "/trips/new" : "/register"} className="btn-primary flex items-center gap-2 text-base">
            Start Planning Free
            <ArrowRight size={18} />
          </Link>
          <Link href={isAuthenticated ? "/dashboard" : "/login"} className="btn-secondary text-base">
            {isAuthenticated ? "View My Trips" : "Log In"}
          </Link>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-orange-500/30 transition-colors">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <f.icon size={20} className="text-orange-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-sm">
        Built with Next.js + Gemini AI
      </footer>
    </main>
  );
}