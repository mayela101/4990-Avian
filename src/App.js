import React, { useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [itinerary, setItinerary] = useState(""); // Store the AI response
  const [loading, setLoading] = useState(false);  

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);   
  
    const destination = document.getElementById("destination").value;
    const preferences = document.getElementById("preferences").value;
    const tripLength = document.getElementById("tripLength").value;
    const hasKids = document.getElementById("hasKids").value === "yes" ? true : false;
  
    // Prompt Engineering
    // Using both Persona and Few-Shot prompts
    const prompt = `
    You are a travel assistant with expertise in creating personalized, budget-friendly itineraries filled with adventure. Your responses should always provide a detailed day-by-day itinerary and ensure that the activities are practical, affordable, and match the user's preferences. The user has provided the following information:
  
    - Destination: ${destination}
    - Preferences: ${preferences}
    - Length of Trip: ${tripLength} days
    - Are there kids on the trip? ${hasKids ? "Yes" : "No"}

    Here are a couple of examples of itineraries you could create:

    **Example 1:**
    Day 1: Arrive in Paris at 9 AM. Visit the Eiffel Tower at 10 AM, followed by lunch at a café near the Louvre. Afternoon at the Musée d'Orsay. Evening Seine River Cruise at 6 PM.
    Day 2: Morning at the Luxembourg Gardens. Lunch in the Latin Quarter. Afternoon visit to Montmartre for stunning views of the city. Dinner at a charming bistro in Le Marais.

    **Example 2:**
    Day 1: Arrive in Tokyo at 8 AM. Explore the Asakusa Temple, then grab lunch at a sushi restaurant nearby. Visit Ueno Park and Zoo in the afternoon. Dinner at Shinjuku.
    Day 2: Visit the Meiji Shrine in the morning. Afterward, go shopping in Harajuku, then relax in Shibuya’s Yoyogi Park. Evening visit to Tokyo Tower.

    Now, based on the above examples and the provided preferences, create a day-by-day itinerary for the user. If the trip is short (less than 4 days), suggest more efficient activities. If there are kids on the trip, include kid-friendly activities.
  `;
  
  
    try {

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer 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`, // Replace with your actual key
          },
        }
      );

      setItinerary(formatItinerary(response.data.choices[0].message.content));
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setItinerary("Failed to generate an itinerary. Please try again.");
    } finally {
      setLoading(false); 
    }
  };

  // Formatting Output by Days
  const formatItinerary = (text) => {

    const days = text.split(/(Day \d+)/); 
    
    const formattedText = days.map((part, index) => {

      if (index % 2 === 0 && part.trim()) {
        return `${part}<br /><br />`; // Add line break x2
      } else {
        return part;
      }
    }).join('');
    
    return formattedText;
  };

  return (
    <div className="container py-5">
      <div className="bubble-container">

        <header>
          <h1 className="title">Avian</h1>
          <p className="slogan">Your personal AI travel assistant!<img src="/avian-icon.png" alt="Avian Logo" className="logo" /></p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="destination" className="form-label">Destination</label>
            <input type="text" className="form-control" id="destination" placeholder="Enter a destination" required />
          </div>
          <div className="mb-3">
            <label htmlFor="preferences" className="form-label">Your Preferences</label>
            <textarea className="form-control" id="preferences" rows="3" placeholder="E.g., adventure, budget-friendly" required></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="tripLength" className="form-label">Length of Trip (in days)</label>
            <input type="number" className="form-control" id="tripLength" placeholder="Enter number of days" required min="1" />
          </div>
          <div className="mb-3">
            <label htmlFor="hasKids" className="form-label">Are there kids on the trip?</label>
            <select className="form-control" id="hasKids" required>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>
        </form>


        {itinerary && !loading && (
          <div className="itinerary mt-4">
            <h2>Generated Itinerary</h2>

            <p className="text-muted" dangerouslySetInnerHTML={{ __html: itinerary }}></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;