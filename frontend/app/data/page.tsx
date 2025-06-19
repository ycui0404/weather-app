"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TIMESTEP_OPTIONS = [
  { label: "Hourly (1h)", value: "1h" },
  { label: "Daily (1d)", value: "1d" },
];

export default function DataPage() {
  const [location, setLocation] = useState("");
  const [timesteps, setTimesteps] = useState<string[]>(["1h", "1d"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [allData, setAllData] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch all data function
  const fetchAllData = async () => {
    const res = await fetch("/api/weather-measurements?all=true");
    const data = await res.json();
    if (Array.isArray(data)) setAllData(data);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleTimestepChange = (value: string) => {
    setTimesteps((prev) =>
      prev.includes(value)
        ? prev.filter((t) => t !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResults(null);
    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }
    if (timesteps.length === 0) {
      setError("Please select at least one timestep.");
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch from Tomorrow.io historical API
      const apiKey = "97egNRRNbJtD3LvgMnjTgZwlPJLnAEx1";
      const url = `https://api.tomorrow.io/v4/weather/history/recent?location=${encodeURIComponent(location)}&timesteps=${timesteps.join(",")}&apikey=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Location not found or not supported.");
      const data = await res.json();
      // Determine available timesteps
      const availableTimesteps: string[] = [];
      if (data?.timelines?.hourly) availableTimesteps.push("1h");
      if (data?.timelines?.daily) availableTimesteps.push("1d");
      // Use all daily data for DB as before
      const daily = data?.timelines?.daily || [];
      if (daily.length === 0) {
        setError("No data found for this location.");
        setLoading(false);
        return;
      }
      // 2. Store in MySQL via API route
      await fetch("/api/weather-measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          measurements: daily.map((d: any) => ({
            date: d.time.slice(0, 10),
            temp_c: d.values.temperatureAvg,
          })),
        }),
      });
      // 3. Fetch from MySQL via API route (fetch all for location)
      const dbRes = await fetch(`/api/weather-measurements?location=${encodeURIComponent(location)}&startDate=1970-01-01&endDate=2100-01-01`);
      const dbData = await dbRes.json();
      if (!Array.isArray(dbData) || dbData.length === 0) {
        setError("No stored data found for this location.");
      } else {
        setResults({ dbData, timesteps: availableTimesteps });
      }
      // 4. Refetch all data for the table
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || "Failed to fetch or store data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await fetch(`/api/weather-measurements?id=${id}`, { method: 'DELETE' });
    await fetchAllData();
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <Card className="w-full max-w-lg shadow-xl">
        <div className="mb-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Weather Data Query</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
            <Input
              type="text"
              placeholder="Enter city, zip, coordinates, etc."
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              disabled={loading}
            />
            <div className="flex gap-4 items-center">
              <span className="font-medium">Timesteps:</span>
              {TIMESTEP_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={timesteps.includes(opt.value)}
                    onChange={() => handleTimestepChange(opt.value)}
                    disabled={loading}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Get Data"}
            </Button>
          </form>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {results && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Results from Database:</div>
              <div className="mb-2">Timesteps includes: [
                {results.timesteps.map((t: string, i: number) => (
                  <span key={t}>{i > 0 && ', '}"{t}"</span>
                ))}
                ]
              </div>
              <ul className="space-y-2">
                {results.dbData.map((row: any) => (
                  <li key={row.id || `${row.location}-${row.measurement_date}`}
                      className="p-2 rounded bg-blue-50 dark:bg-gray-900/60">
                    <div><b>Date:</b> {new Date(row.measurement_date).toLocaleDateString("en-US")}</div>
                    <div><b>Avg Temp:</b> {row.temp_c !== null ? `${Math.round(row.temp_c)}°C` : "N/A"}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* All data section */}
          <div className="mt-8">
            <div className="font-semibold mb-2">All Stored Weather Data:</div>
            {allData.length === 0 ? (
              <div className="text-gray-500">No data in database yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Location</th>
                      <th className="px-2 py-1 text-left">Date</th>
                      <th className="px-2 py-1 text-left">Avg Temp (°C)</th>
                      <th className="px-2 py-1 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allData.map((row: any, i: number) => (
                      <tr key={row.id || `${row.location}-${row.measurement_date}-${i}`}
                        className={i % 2 === 0 ? "bg-blue-50 dark:bg-gray-900/60" : ""}>
                        <td className="px-2 py-1">{row.location}</td>
                        <td className="px-2 py-1">{new Date(row.measurement_date).toLocaleDateString("en-US")}</td>
                        <td className="px-2 py-1">{row.temp_c !== null ? `${Math.round(row.temp_c)}°C` : "N/A"}</td>
                        <td className="px-2 py-1">
                          <button
                            className="text-red-600 hover:underline disabled:opacity-50"
                            onClick={() => handleDelete(row.id)}
                            disabled={deletingId === row.id}
                          >
                            {deletingId === row.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 