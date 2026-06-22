import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Reception from "@/pages/Reception";
import Construction from "@/pages/Construction";
import Members from "@/pages/Members";
import Checkout from "@/pages/Checkout";
import Maintenance from "@/pages/Maintenance";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/construction" element={<Construction />} />
          <Route path="/members" element={<Members />} />
          <Route path="/checkout/:orderId" element={<Checkout />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
      </Routes>
    </Router>
  );
}
