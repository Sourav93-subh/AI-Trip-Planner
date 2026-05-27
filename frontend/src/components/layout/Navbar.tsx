// ============================================================
// src/components/layout/Navbar.tsx — Top Navigation Bar
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import clsx from "clsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "My Trips" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <MapPin className="text-orange-500" size={22} />
          <span className="font-display text-xl font-bold text-white">TripAI</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/trips/new"
            className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <Plus size={16} />
            New Trip
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-700">
            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
              <User size={16} className="text-orange-400" />
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">
              {user?.name?.split(" ")[0]}
            </span>
            <button
              onClick={logout}
              title="Log out"
              className="p-2 text-gray-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}