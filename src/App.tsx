import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/DashboardMetrics";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
