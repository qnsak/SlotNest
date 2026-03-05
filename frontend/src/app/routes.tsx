import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AdminGuard } from "./guards/AdminGuard";
import { UserGuard } from "./guards/UserGuard";
import { AdminLayout } from "./layout/AdminLayout";
import { UserLayout } from "./layout/UserLayout";
import { BookingLookupPage } from "../pages/BookingLookupPage";
import { HomePage } from "../pages/HomePage";
import { AdminBookingsPage } from "../pages/admin/AdminBookingsPage";
import { AdminIntervalsPage } from "../pages/admin/AdminIntervalsPage";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route element={<UserGuard />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingLookupPage />} />
          </Route>
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/intervals" element={<AdminIntervalsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
