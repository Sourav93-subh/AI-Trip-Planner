// ============================================================
// src/app/trips/[id]/page.tsx — Trip Detail Page
// Shows: itinerary, budget, hotels, packing list tabs
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft, Calendar, Wallet, MapPin, Hotel,
  Luggage, RefreshCw, Plus, Trash2, Loader2,
  ChevronDown, ChevronUp, DollarSign, Star,
  Sparkles
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { tripsApi, aiApi } from "@/lib/api";
import { Trip, TripDay, Activity, Hotel as HotelType, PackingList } from "@/types";
import clsx from "clsx";

const TABS = ["Itinerary", "Budget", "Hotels", "Packing List"] as const;
type Tab = typeof TABS[number];

const CATEGORY_COLORS: Record<string, string> = {
  food: "bg-amber-500/20 text-amber-300",
  culture: "bg-blue-500/20 text-blue-300",
  adventure: "bg-green-500/20 text-green-300",
  shopping: "bg-pink-500/20 text-pink-300",
  transport: "bg-gray-500/20 text-gray-300",
  accommodation: "bg-purple-500/20 text-purple-300",
  other: "bg-gray-500/20 text-gray-300",
};

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("Itinerary");
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [regenInstruction, setRegenInstruction] = useState("");
  const [regenDayOpen, setRegenDayOpen] = useState<number | null>(null);
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [packingList, setPackingList] = useState<PackingList | null>(null);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingPacking, setLoadingPacking] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const res = await tripsApi.getOne(id);
      const t = res.data.trip;
      setTrip(t);
      setHotels(t.hotels || []);
      setNotes(t.notes || "");
    } catch {
      toast.error("Failed to load trip");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) next.delete(dayNum);
      else next.add(dayNum);
      return next;
    });
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    setRegeneratingDay(dayNumber);
    try {
      const res = await aiApi.regenerateDay(id, dayNumber, regenInstruction);
      setTrip(res.data.trip);
      toast.success(`Day ${dayNumber} regenerated!`);
      setRegenDayOpen(null);
      setRegenInstruction("");
    } catch {
      toast.error("Failed to regenerate day");
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityId: string) => {
    if (!confirm("Remove this activity?")) return;
    try {
      const res = await tripsApi.removeActivity(id, dayNumber, activityId);
      setTrip(res.data.trip);
      toast.success("Activity removed");
    } catch {
      toast.error("Failed to remove activity");
    }
  };

  const handleLoadHotels = async () => {
    if (hotels.length > 0) return; // Already loaded
    setLoadingHotels(true);
    try {
      const res = await aiApi.getHotels(id);
      setHotels(res.data.hotels);
      toast.success("Hotel suggestions ready!");
    } catch {
      toast.error("Failed to load hotels");
    } finally {
      setLoadingHotels(false);
    }
  };

  const handleLoadPacking = async () => {
    if (packingList) return;
    setLoadingPacking(true);
    try {
      const res = await aiApi.getPackingList(id);
      setPackingList(res.data.packingList);
      toast.success("Packing list ready!");
    } catch {
      toast.error("Failed to generate packing list");
    } finally {
      setLoadingPacking(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await tripsApi.update(id, { notes });
      toast.success("Notes saved!");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  // Load hotels/packing when tab changes
  useEffect(() => {
    if (activeTab === "Hotels") handleLoadHotels();
    if (activeTab === "Packing List") handleLoadPacking();
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const totalCost = trip.budget?.total || 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to trips
        </Link>

        {/* Trip Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white mb-1">{trip.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
            <span className="flex items-center gap-1"><MapPin size={13} />{trip.destination}</span>
            <span className="flex items-center gap-1"><Calendar size={13} />{trip.numberOfDays} days</span>
            <span className="flex items-center gap-1"><DollarSign size={13} />${totalCost.toLocaleString()} est.</span>
            <span className="flex items-center gap-1">
              <Sparkles size={13} className="text-orange-400" />
              {trip.interests.slice(0, 3).join(", ")}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 border border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                activeTab === tab
                  ? "bg-orange-500 text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── ITINERARY TAB ── */}
        {activeTab === "Itinerary" && (
          <div className="space-y-3">
            {trip.itinerary?.map((day) => (
              <div key={day.dayNumber} className="card">
                {/* Day header */}
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleDay(day.dayNumber)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-lg flex items-center justify-center">
                      {day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{day.title}</h3>
                      <span className="text-xs text-gray-400">{day.activities.length} activities</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRegenDayOpen(regenDayOpen === day.dayNumber ? null : day.dayNumber);
                      }}
                      className="p-1.5 text-gray-400 hover:text-orange-400 transition-colors"
                      title="Regenerate this day"
                    >
                      <RefreshCw size={15} />
                    </button>
                    {expandedDays.has(day.dayNumber) ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Regenerate instruction input */}
                {regenDayOpen === day.dayNumber && (
                  <div className="mt-3 pt-3 border-t border-gray-800 flex gap-2">
                    <input
                      type="text"
                      value={regenInstruction}
                      onChange={(e) => setRegenInstruction(e.target.value)}
                      placeholder='e.g. "More street food" or "Less touristy"'
                      className="input text-sm flex-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRegenerateDay(day.dayNumber); }}
                      disabled={regeneratingDay === day.dayNumber}
                      className="btn-primary text-sm py-2 px-4 flex items-center gap-1 whitespace-nowrap"
                    >
                      {regeneratingDay === day.dayNumber ? (
                        <><span className="spinner" /> Generating...</>
                      ) : (
                        <><RefreshCw size={13} /> Regenerate</>
                      )}
                    </button>
                  </div>
                )}

                {/* Activities */}
                {expandedDays.has(day.dayNumber) && (
                  <div className="mt-4 space-y-3">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex gap-3 p-3 bg-gray-800/50 rounded-xl group"
                      >
                        <div className="text-xs text-gray-500 w-16 flex-shrink-0 pt-0.5">
                          {act.time}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-white text-sm">{act.title}</h4>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className={clsx("text-xs px-2 py-0.5 rounded-full", CATEGORY_COLORS[act.category])}>
                                {act.category}
                              </span>
                              {act.estimatedCost > 0 && (
                                <span className="text-xs text-gray-400">${act.estimatedCost}</span>
                              )}
                              <button
                                onClick={() => handleRemoveActivity(day.dayNumber, act.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-red-400 transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Travel Journal / Notes */}
            <div className="card mt-6">
              <h3 className="font-semibold text-white mb-3">✏️ Travel Journal Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your thoughts, reminders, or things you want to do..."
                className="input resize-none h-28"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn-secondary text-sm mt-3"
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        )}

        {/* ── BUDGET TAB ── */}
        {activeTab === "Budget" && trip.budget && (
          <div className="card animate-fade-in">
            <h2 className="text-xl font-semibold text-white mb-6">Budget Breakdown</h2>
            <div className="space-y-4">
              {[
                { label: "✈️ Flights", key: "flights" },
                { label: "🏨 Accommodation", key: "accommodation" },
                { label: "🍜 Food", key: "food" },
                { label: "🎡 Activities", key: "activities" },
                { label: "🚌 Local Transport", key: "transport" },
              ].map(({ label, key }) => {
                const amount = (trip.budget as any)[key] || 0;
                const pct = totalCost > 0 ? (amount / totalCost) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{label}</span>
                      <span className="font-medium text-white">
                        ${amount.toLocaleString()} {trip.budget.currency}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total Estimate</span>
              <span className="text-2xl font-bold text-orange-400">
                ${totalCost.toLocaleString()} {trip.budget.currency}
              </span>
            </div>

            {trip.budget.notes && (
              <p className="mt-4 text-sm text-gray-400 bg-gray-800/50 rounded-xl p-4">
                📝 {trip.budget.notes}
              </p>
            )}
          </div>
        )}

        {/* ── HOTELS TAB ── */}
        {activeTab === "Hotels" && (
          <div className="animate-fade-in">
            {loadingHotels && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="animate-spin text-orange-500 mx-auto mb-3" size={32} />
                  <p className="text-gray-400">Finding best hotels...</p>
                </div>
              </div>
            )}
            {!loadingHotels && hotels.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400">Loading hotel suggestions...</p>
              </div>
            )}
            {!loadingHotels && hotels.length > 0 && (
              <div className="grid gap-4">
                {["budget", "mid-range", "luxury"].map((cat) => {
                  const catHotels = hotels.filter((h) => h.category === cat);
                  if (catHotels.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 capitalize">
                        {cat === "mid-range" ? "Mid-Range" : cat}
                      </h3>
                      <div className="space-y-3">
                        {catHotels.map((hotel, i) => (
                          <div key={i} className="card">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-white">{hotel.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        size={12}
                                        className={i < Math.round(hotel.rating) ? "text-amber-400 fill-amber-400" : "text-gray-600"}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-400">{hotel.rating}/5</span>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-lg font-bold text-white">${hotel.pricePerNight}</span>
                                <span className="text-xs text-gray-400 block">/night</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {hotel.highlights.map((h, j) => (
                                <span key={j} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                                  {h}
                                </span>
                              ))}
                            </div>
                            {hotel.bookingTip && (
                              <p className="mt-3 text-xs text-gray-400 bg-gray-800/50 rounded-lg px-3 py-2">
                                💡 {hotel.bookingTip}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PACKING LIST TAB ── */}
        {activeTab === "Packing List" && (
          <div className="animate-fade-in">
            {loadingPacking && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="animate-spin text-orange-500 mx-auto mb-3" size={32} />
                  <p className="text-gray-400">Generating smart packing list...</p>
                </div>
              </div>
            )}
            {!loadingPacking && packingList && (
              <div className="grid gap-4">
                {(
                  [
                    { key: "essentials", label: "🛂 Essentials", color: "text-red-400" },
                    { key: "clothing", label: "👕 Clothing", color: "text-blue-400" },
                    { key: "toiletries", label: "🧴 Toiletries", color: "text-green-400" },
                    { key: "electronics", label: "🔌 Electronics", color: "text-purple-400" },
                    { key: "activitySpecific", label: "🎒 Activity Gear", color: "text-amber-400" },
                    { key: "tips", label: "💡 Packing Tips", color: "text-orange-400" },
                  ] as const
                ).map(({ key, label, color }) => {
                  const items = (packingList as any)[key] as string[];
                  if (!items?.length) return null;
                  return (
                    <div key={key} className="card">
                      <h3 className={`font-semibold mb-3 ${color}`}>{label}</h3>
                      <ul className="space-y-1.5">
                        {items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="w-4 h-4 border border-gray-600 rounded mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}