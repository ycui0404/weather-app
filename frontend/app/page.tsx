"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Home() {
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }
    setLoading(true);
    // Optionally, you could validate the location here with an API call
    router.push(`/weather?location=${encodeURIComponent(location)}`);
    setLoading(false);
  };

  const handleUseMyLocation = () => {
    setGeoError("");
    setGeoLoading(true);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        router.push(`/weather?location=${latitude},${longitude}`);
        setGeoLoading(false);
      },
      (err) => {
        setGeoError("Unable to retrieve your location.");
        setGeoLoading(false);
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 bg-gradient-to-br from-blue-100 via-white to-blue-200 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Weather App</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter city, zip, landmark, etc."
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Get Weather"}
            </Button>
          </form>
          <div className="flex flex-col gap-2 mb-4">
            <Button variant="secondary" onClick={handleUseMyLocation} disabled={geoLoading}>
              {geoLoading ? "Detecting..." : "Use My Location"}
            </Button>
            {geoError && (
              <Alert variant="destructive">
                <AlertDescription>{geoError}</AlertDescription>
              </Alert>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => router.push('/data')}>
              Go to Data Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
