"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// Map Tomorrow.io weatherCode to emoji icons
const weatherCodeToIcon: Record<string, string> = {
  "0": "☀️", // Clear
  "1000": "☀️", // Clear
  "1001": "☁️", // Cloudy
  "1100": "🌤️", // Mostly Clear
  "1101": "🌥️", // Partly Cloudy
  "1102": "☁️", // Mostly Cloudy
  "2000": "🌫️", // Fog
  "2100": "🌫️", // Light Fog
  "4000": "🌧️", // Drizzle
  "4001": "🌧️", // Rain
  "4200": "🌦️", // Light Rain
  "4201": "🌧️", // Heavy Rain
  "5000": "❄️", // Snow
  "5001": "❄️", // Flurries
  "5100": "🌨️", // Light Snow
  "5101": "❄️", // Heavy Snow
  "6000": "🌧️", // Freezing Drizzle
  "6001": "🌧️", // Freezing Rain
  "6200": "🌧️", // Light Freezing Rain
  "6201": "🌧️", // Heavy Freezing Rain
  "7000": "🌩️", // Ice Pellets
  "7101": "🌩️", // Heavy Ice Pellets
  "7102": "🌩️", // Light Ice Pellets
  "8000": "⛈️", // Thunderstorm
};

function getWeatherIcon(code: any) {
  if (!code) return "❓";
  return weatherCodeToIcon[String(code)] || "❓";
}

export default function WeatherPage() {
  const searchParams = useSearchParams();
  const location = searchParams.get("location") || "";
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(0); // index in daily forecast

  useEffect(() => {
    if (!location) {
      setError("No location provided.");
      setLoading(false);
      return;
    }
    const fetchWeather = async () => {
      setLoading(true);
      setError("");
      setWeather(null);
      try {
        const apiKey = "97egNRRNbJtD3LvgMnjTgZwlPJLnAEx1";
        const url = `https://api.tomorrow.io/v4/weather/forecast?location=${encodeURIComponent(location)}&apikey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error("Failed to fetch weather");
        }
        const data = await res.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch weather");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  // Helper to extract daily forecast from Tomorrow.io response
  const getDailyForecast = () => {
    if (!weather || !weather.timelines || !weather.timelines.daily) return [];
    return weather.timelines.daily.slice(0, 5); // 5 days
  };
  const daily = getDailyForecast();
  const selected = daily[selectedDay];
  const resolvedLocation = weather?.location?.name || location;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <div className="flex w-full max-w-3xl gap-6">
        {/* Sidebar */}
        <aside className="w-72 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg text-center">5-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {daily.length === 0 && <div className="text-center text-gray-500">No forecast data available</div>}
              {daily.map((day: any, idx: number) => (
                <button
                  key={day.time}
                  className={`w-full rounded px-2 py-2 text-left transition-colors ${selectedDay === idx ? "bg-blue-200 dark:bg-gray-800 font-bold" : "hover:bg-blue-100 dark:hover:bg-gray-900"}`}
                  onClick={() => setSelectedDay(idx)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl mr-2">{getWeatherIcon(day.values.weatherCodeMax)}</span>
                    <span>{formatDate(day.time)}</span>
                    <span className="text-lg">
                      {day.values.temperatureAvg ? `${Math.round(day.values.temperatureAvg)}°C` : "N/A"}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>
        {/* Main weather card */}
        <main className="flex-1">
          <Card className="w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{resolvedLocation}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <div className="text-center py-8">Loading...</div>}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {selected && !loading && !error && (
                <div>
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-6xl mb-1">{getWeatherIcon(selected.values.weatherCodeMax)}</span>
                    <div className="text-xl font-semibold text-center">{formatDate(selected.time)}</div>
                  </div>
                  <div className="text-5xl font-bold mb-4 text-center">
                    {selected.values.temperatureAvg ? `${Math.round(selected.values.temperatureAvg)}°C` : "N/A"}
                  </div>
                  <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <div>Min: {selected.values.temperatureMin ? `${Math.round(selected.values.temperatureMin)}°C` : "N/A"}</div>
                    <div>Max: {selected.values.temperatureMax ? `${Math.round(selected.values.temperatureMax)}°C` : "N/A"}</div>
                    <div>Humidity: {selected.values.humidityAvg ? `${Math.round(selected.values.humidityAvg)}%` : "N/A"}</div>
                    <div>Wind: {selected.values.windSpeedAvg ? `${Math.round(selected.values.windSpeedAvg)} m/s` : "N/A"}</div>
                    <div>Precipitation: {selected.values.precipitationSum ? `${selected.values.precipitationSum} mm` : "N/A"}</div>
                  </div>
                  <div className="text-center text-gray-500 text-xs">Powered by Tomorrow.io</div>
                </div>
              )}
              <div className="mt-6 flex justify-center">
                <Button variant="outline" onClick={() => window.history.back()}>
                  ← Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 