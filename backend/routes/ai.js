// ============================================================
// routes/ai.js — AI-Powered Routes using Google Gemini (FREE)
// ============================================================

const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/auth");

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.use(protect);

async function callGemini(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });
  const rawText = response.text;
  const jsonMatch = rawText.match(/```json\n?([\s\S]*?)\n?```/) || rawText.match(/(\{[\s\S]*\})/);
  if (!jsonMatch) throw new Error("Could not parse AI response as JSON");
  return JSON.parse(jsonMatch[1] || jsonMatch[0]);
}

router.post("/generate", async (req, res) => {
  const { tripId } = req.body;
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Access denied." });

    const prompt = `You are an expert travel planner. Create a complete travel itinerary. Always respond with valid JSON only, wrapped in \`\`\`json\`\`\` code blocks.

Trip details:
- Destination: ${trip.destination}
- Number of Days: ${trip.numberOfDays}
- Budget Type: ${trip.budgetType} (low=budget, medium=comfortable, high=luxury)
- Interests: ${trip.interests.join(", ")}
- Travel Month: ${trip.travelMonth || "not specified"}
- Group Size: ${trip.groupSize} person(s)

Return this EXACT JSON structure:
{
  "title": "Catchy trip title",
  "itinerary": [
    {
      "dayNumber": 1,
      "title": "Day 1 – Theme Here",
      "activities": [
        {
          "id": "act_1_1",
          "time": "9:00 AM",
          "title": "Activity name",
          "description": "Helpful description with tips",
          "category": "culture",
          "estimatedCost": 0
        }
      ]
    }
  ],
  "budget": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "transport": 80,
    "total": 1030,
    "currency": "USD",
    "notes": "Budget notes here"
  }
}

Rules: 4-6 activities per day, category must be one of: food, culture, adventure, shopping, transport, accommodation, other. Return ONLY the JSON.`;

    const aiData = await callGemini(prompt);
    trip.title = aiData.title || trip.title;
    trip.itinerary = aiData.itinerary;
    trip.budget = aiData.budget;
    trip.status = "generated";
    await trip.save();
    res.json({ message: "Itinerary generated successfully!", trip });
  } catch (error) {
    console.error("AI generate error:", error);
    res.status(500).json({ error: "Failed to generate itinerary. Please try again." });
  }
});

router.post("/regenerate-day", async (req, res) => {
  const { tripId, dayNumber, instruction } = req.body;
  if (!tripId || !dayNumber) return res.status(400).json({ error: "tripId and dayNumber are required." });
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Access denied." });

    const prompt = `You are an expert travel planner. Respond with valid JSON only in \`\`\`json\`\`\` blocks.

Regenerate Day ${dayNumber} of a trip to ${trip.destination}.
Budget: ${trip.budgetType}, Interests: ${trip.interests.join(", ")}
Special instruction: ${instruction || "Make it interesting and varied"}

Return this EXACT JSON:
{
  "dayNumber": ${dayNumber},
  "title": "Day ${dayNumber} – Theme Here",
  "activities": [
    {
      "id": "act_${dayNumber}_1",
      "time": "9:00 AM",
      "title": "Activity name",
      "description": "Helpful description",
      "category": "culture",
      "estimatedCost": 15
    }
  ]
}

Include 4-6 activities. Return ONLY the JSON.`;

    const newDay = await callGemini(prompt);
    const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === dayNumber);
    if (dayIndex === -1) return res.status(404).json({ error: "Day not found." });
    trip.itinerary[dayIndex] = newDay;
    trip.status = "modified";
    trip.markModified("itinerary");
    await trip.save();
    res.json({ message: `Day ${dayNumber} regenerated!`, day: newDay, trip });
  } catch (error) {
    console.error("Regenerate day error:", error);
    res.status(500).json({ error: "Failed to regenerate day." });
  }
});

router.post("/hotels", async (req, res) => {
  const { tripId } = req.body;
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Access denied." });

    const prompt = `You are a hotel expert. Respond with valid JSON only in \`\`\`json\`\`\` blocks.

Suggest 6 hotels for ${trip.destination}. Budget: ${trip.budgetType}. Nights: ${trip.numberOfDays}.

Return this EXACT JSON:
{
  "hotels": [
    {
      "name": "Hotel Name",
      "category": "budget",
      "pricePerNight": 45,
      "rating": 4.2,
      "highlights": ["Free WiFi", "City Center"],
      "bookingTip": "Book in advance for best rates."
    }
  ]
}

Include 2 budget, 2 mid-range, 2 luxury. category must be: "budget", "mid-range", or "luxury". Return ONLY the JSON.`;

    const aiData = await callGemini(prompt);
    trip.hotels = aiData.hotels;
    await trip.save();
    res.json({ message: "Hotels suggested!", hotels: aiData.hotels });
  } catch (error) {
    console.error("Hotels error:", error);
    res.status(500).json({ error: "Failed to get hotel suggestions." });
  }
});

router.post("/packing-list", async (req, res) => {
  const { tripId } = req.body;
  try {
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found." });
    if (trip.userId.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Access denied." });

    const prompt = `You are a packing expert. Respond with valid JSON only in \`\`\`json\`\`\` blocks.

Create a smart packing list for:
- Destination: ${trip.destination}
- Duration: ${trip.numberOfDays} days
- Month: ${trip.travelMonth || "not specified"}
- Interests: ${trip.interests.join(", ")}
- Budget: ${trip.budgetType}

Return this EXACT JSON:
{
  "packingList": {
    "essentials": ["Passport", "Phone charger"],
    "clothing": ["5 t-shirts", "Walking shoes"],
    "toiletries": ["Sunscreen", "Toothbrush"],
    "electronics": ["Power bank", "Universal adapter"],
    "activitySpecific": ["Hiking boots", "Swimsuit"],
    "tips": ["Roll clothes to save space"]
  }
}

Return ONLY the JSON.`;

    const aiData = await callGemini(prompt);
    res.json({ message: "Packing list generated!", packingList: aiData.packingList });
  } catch (error) {
    console.error("Packing list error:", error);
    res.status(500).json({ error: "Failed to generate packing list." });
  }
});

module.exports = router;