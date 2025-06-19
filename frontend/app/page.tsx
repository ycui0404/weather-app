"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Simple modal component
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh]">
        <button className="absolute top-2 right-2 text-2xl" onClick={onClose} aria-label="Close">×</button>
        <div className="overflow-y-auto max-h-[70vh] pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!location.trim()) {
      setError("Please enter a location");
      return;
    }
    setLoading(true);
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
        <CardHeader className="flex flex-col items-center gap-2">
          <CardTitle className="text-3xl text-center">Weather App</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">by Yujie Cui</span>
            <Button size="sm" variant="outline" onClick={() => setInfoOpen(true)} aria-label="Info about PM Accelerator">Info</Button>
          </div>
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
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)}>
        <h2 className="text-xl font-bold mb-2">PM Accelerator Overview</h2>
        <p className="mb-2">The Product Manager Accelerator Program is designed to support PM professionals through every stage of their careers. From students looking for entry-level jobs to Directors looking to take on a leadership role, our program has helped over hundreds of students fulfill their career aspirations.</p>
        <p className="mb-2">Our Product Manager Accelerator community are ambitious and committed. Through our program they have learnt, honed and developed new PM and leadership skills, giving them a strong foundation for their future endeavors.</p>
        <p className="mb-2">Here are the examples of services we offer. Check out our website (link under my profile) to learn more about our services.</p>
        <ul className="list-disc pl-5 mb-2 text-sm">
          <li><b>🚀 PMA Pro:</b> End-to-end product manager job hunting program that helps you master FAANG-level Product Management skills, conduct unlimited mock interviews, and gain job referrals through our largest alumni network. 25% of our offers came from tier 1 companies and get paid as high as $800K/year.</li>
          <li><b>🚀 AI PM Bootcamp:</b> Gain hands-on AI Product Management skills by building a real-life AI product with a team of AI Engineers, data scientists, and designers. We will also help you launch your product with real user engagement using our 100,000+ PM community and social media channels.</li>
          <li><b>🚀 PMA Power Skills:</b> Designed for existing product managers to sharpen their product management skills, leadership skills, and executive presentation skills.</li>
          <li><b>🚀 PMA Leader:</b> We help you accelerate your product management career, get promoted to Director and product executive levels, and win in the board room.</li>
          <li><b>🚀 1:1 Resume Review:</b> We help you rewrite your killer product manager resume to stand out from the crowd, with an interview guarantee. Get started by using our FREE killer PM resume template used by over 14,000 product managers. <a href="https://www.drnancyli.com/pmresume" className="text-blue-600 underline" target="_blank">Resume Template</a></li>
          <li><b>🚀 500+ Free Trainings:</b> Please go to our <a href="https://www.youtube.com/c/drnancyli" className="text-blue-600 underline" target="_blank">YouTube channel</a> and Instagram <a href="https://instagram.com/drnancyli" className="text-blue-600 underline" target="_blank">@drnancyli</a> to start learning for free today.</li>
        </ul>
        <div className="mb-2 text-sm">
          <b>Website:</b> <a href="https://www.pmaccelerator.io/" className="text-blue-600 underline" target="_blank">https://www.pmaccelerator.io/</a><br/>
          <b>Phone:</b> +1 954-889-1063<br/>
          <b>Industry:</b> E-Learning Providers<br/>
          <b>Company size:</b> 2-10 employees<br/>
          <b>Headquarters:</b> Boston, MA<br/>
          <b>Founded:</b> 2020<br/>
          <b>Specialties:</b> Product Management, Product Manager, Product Management Training, Product Management Certification, Product Lead, Product Executive, Associate Product Manager, product management coaching, product manager resume, Product Management Interview, VP of Product, Director of Product, Chief Product Officer, and AI Product Management
        </div>
      </Modal>
    </div>
  );
}
