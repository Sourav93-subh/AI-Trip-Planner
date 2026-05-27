// ============================================================
// src/app/dashboard/page.tsx — Dashboard (list of all trips)
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus, MapPin, Calendar, Wallet, Trash2,
  Heart, Sparkles, Loader2
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/lib/auth-context";
import { tripsApi } from "@/lib/api";
import { Trip } from "@/types";
import clsx from "clsx";

const BUDGET_LABELS = { low: "Budget", medium: "Mid-Range", high: "Luxury" };
const BUDGET_COLORS = {
  low: "text-green-400 bg-green-400/10",
  medium: "text-blue-400 bg-blue-400/10",
  high: "text-purple-400 bg-purple-400/10",
};

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch trips
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTrips();
  }, [isAuthenticated]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      const res = await tripsApi.getAll();
      setTrips(res.data.trips);
    } catch {
      toast.error("Failed to load trips");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Don't navigate to trip page
    e.stopPropagation();
    if (!confirm("Delete this trip?")) return;
    try {
      await tripsApi.delete(id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
      toast.success("Trip deleted");
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const handleFavorite = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await tripsApi.toggleFavorite(id);
      setTrips((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isFavorite: res.data.isFavorite } : t))
      );
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  if (authLoading || (!isAuthenticated && !authLoading)) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white font-display">My Trips</h1>
            <p className="text-gray-400 mt-1">
              {trips.length === 0 ? "No trips yet" : `${trips.length} trip${trips.length > 1 ? "s" : ""} planned`}
            </p>
          </div>
          <Link href="/trips/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Trip
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-orange-500" size={36} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && trips.length === 0 && (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No trips yet</h2>
            <p className="text-gray-400 mb-6">Plan your first AI-powered adventure</p>
            <Link href="/trips/new" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={16} />
              Create My First Trip
            </Link>
          </div>
        )}

        {/* Trip grid */}
        {!isLoading && trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {trips.map((trip) => (
              <Link
                key={trip._id}
                href={`/trips/${trip._id}`}
                className="card hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-200 relative group block"
              >
                {/* Favorite & Delete buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleFavorite(trip._id, e)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700"
                  >
                    <Heart
                      size={14}
                      className={trip.isFavorite ? "fill-red-400 text-red-400" : "text-gray-400"}
                    />
                  </button>
                  <button
                    onClick={(e) => handleDelete(trip._id, e)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-red-500/20"
                  >
                    <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                  </button>
                </div>

                {/* Destination */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white leading-tight">
                      {trip.title || trip.destination}
                    </h3>
                    <p className="text-sm text-gray-400">{trip.destination}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {trip.numberOfDays} days
                  </span>
                  <span
                    className={clsx(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      BUDGET_COLORS[trip.budgetType]
                    )}
                  >
                    {BUDGET_LABELS[trip.budgetType]}
                  </span>
                  {trip.status === "generated" && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-orange-400 bg-orange-400/10">
                      ✓ Generated
                    </span>
                  )}
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {trip.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                  {trip.interests.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{trip.interests.length - 3} more
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}