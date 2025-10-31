import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Home from "@/pages/Home";
import BandwidthSaver from "@/pages/BandwidthSaver";
import TrafficAnalysis from "@/pages/TrafficAnalisis";
import RequestMetricsPage from "@/pages/RequestMetricsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="bandwidth" element={<BandwidthSaver />} />
          <Route path="traffic" element={<TrafficAnalysis />} />
          <Route path="requests" element={<RequestMetricsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
