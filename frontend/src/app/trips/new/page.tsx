// ============================================================
// src/app/trips/new/page.tsx — Create New Trip Form
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Sparkles, MapPin, Calendar, Wallet, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { tripsApi, aiApi } from "@/lib/api";
import clsx from "clsx";

// Predefined interest options the user can pick
const INTEREST_OPTIONS = [
  "Culture & History", "Food & Cuisine", "Adventure & Hiking",
  "Beaches & Swimming", "Shopping", "Nightlife", "Museums & Art",
  "Wildlife & Nature", "Photography", "Architecture", "Spirituality",
  "Local Markets", "Sports", "Relaxation & Spa",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function NewTripPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    destination: "",
    numberOfDays: 5,
    budgetType: "medium" as "low" | "medium" | "high",
    interests: [] as string[],
    travelMonth: "",
    groupSize: 1,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleInterest = (interest: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }
    if (form.interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setIsCreating(true);
    try {
      // Step 1: Create trip in database
      const createRes = await tripsApi.create(form);
      const tripId = createRes.data.trip._id;

      // Step 2: Generate itinerary with AI
      setIsGenerating(true);
      toast.loading("AI is crafting your itinerary...", { id: "generating" });

      await aiApi.generate(tripId);

      toast.success("Itinerary ready! ✈️", { id: "generating" });
      router.push(`/trips/${tripId}`);
    } catch (err: any) {
      toast.dismiss("generating");
      toast.error(err.response?.data?.error || "Failed to create trip");
      setIsCreating(false);
      setIsGenerating(false);
    }
  };

  const budgetOptions = [
    { value: "low", label: "Budget", desc: "Hostels, street food, free activities", emoji: "💰" },
    { value: "medium", label: "Mid-Range", desc: "3-star hotels, local restaurants", emoji: "💳" },
    { value: "high", label: "Luxury", desc: "5-star hotels, fine dining, premium tours", emoji: "✨" },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 animate-slide-up">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to trips
        </Link>

        <h1 className="text-3xl font-bold font-display text-white mb-2">Plan a New Trip</h1>
        <p className="text-gray-400 mb-8">Fill in the details and AI will build your itinerary</p>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Destination */}
          <div className="card">
            <label className="label flex items-center gap-2">
              <MapPin size={15} className="text-orange-400" />
              Where do you want to go?
            </label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
              placeholder="e.g. Tokyo, Japan · Bali, Indonesia · Paris, France"
              className="input text-lg"
              required
              autoFocus
            />
          </div>

          {/* Days & Group */}
          <div className="card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Calendar size={15} className="text-orange-400" />
                  Number of Days
                </label>
                <input
                  type="number"
                  value={form.numberOfDays}
                  onChange={(e) => setForm((p) => ({ ...p, numberOfDays: Number(e.target.value) }))}
                  min={1}
                  max={30}
                  className="input"
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Users size={15} className="text-orange-400" />
                  Group Size
                </label>
                <input
                  type="number"
                  value={form.groupSize}
                  onChange={(e) => setForm((p) => ({ ...p, groupSize: Number(e.target.value) }))}
                  min={1}
                  max={20}
                  className="input"
                />
              </div>
            </div>

            {/* Travel Month */}
            <div className="mt-4">
              <label className="label">Travel Month (optional)</label>
              <select
                value={form.travelMonth}
                onChange={(e) => setForm((p) => ({ ...p, travelMonth: e.target.value }))}
                className="input"
              >
                <option value="">Select month...</option>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="card">
            <label className="label flex items-center gap-2">
              <Wallet size={15} className="text-orange-400" />
              Budget Type
            </label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, budgetType: opt.value as any }))}
                  className={clsx(
                    "p-4 rounded-xl border text-left transition-all",
                    form.budgetType === opt.value
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  )}
                >
                  <span className="text-2xl block mb-1">{opt.emoji}</span>
                  <span className="font-medium text-white text-sm block">{opt.label}</span>
                  <span className="text-xs text-gray-400 leading-tight block mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="card">
            <label className="label">
              What are you interested in?{" "}
              <span className="text-gray-500 font-normal">
                ({form.interests.length} selected)
              </span>
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                    form.interests.includes(interest)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isCreating || isGenerating}
            className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                AI is building your itinerary...
              </>
            ) : isCreating ? (
              <>
                <span className="spinner" />
                Saving trip...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate AI Itinerary
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}