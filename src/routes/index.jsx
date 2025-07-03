// src/routes/index.jsx
import { Route, Routes } from "react-router-dom";
import DashboardPage from "@/pages/DashboardPage";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardPage />} />
    {/* route lain */}
  </Routes>
);

export default AppRoutes;
