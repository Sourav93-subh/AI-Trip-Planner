// ============================================================
// src/types/index.ts — All TypeScript types for the app
// TypeScript types = "contracts" that describe the shape of data
// This prevents bugs by catching type errors at compile time
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export type BudgetType = "low" | "medium" | "high";
export type ActivityCategory =
  | "food"
  | "culture"
  | "adventure"
  | "shopping"
  | "transport"
  | "accommodation"
  | "other";

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
}

export interface TripDay {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

export interface Budget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  total: number;
  currency: string;
  notes: string;
}

export interface Hotel {
  name: string;
  category: "budget" | "mid-range" | "luxury";
  pricePerNight: number;
  rating: number;
  highlights: string[];
  bookingTip: string;
}

export interface PackingList {
  essentials: string[];
  clothing: string[];
  toiletries: string[];
  electronics: string[];
  activitySpecific: string[];
  tips: string[];
}

export type TripStatus = "draft" | "generated" | "modified";

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  numberOfDays: number;
  budgetType: BudgetType;
  interests: string[];
  travelMonth: string;
  groupSize: number;
  title: string;
  itinerary: TripDay[];
  budget: Budget;
  hotels: Hotel[];
  status: TripStatus;
  notes: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form input types
export interface TripFormData {
  destination: string;
  numberOfDays: number;
  budgetType: BudgetType;
  interests: string[];
  travelMonth: string;
  groupSize: number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}