import React, { useEffect, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import HotelRegistration from "./components/HotelRegistration";
import { Toaster, toast, useToasterStore } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import Loader from "./components/Loader";

// Lazy-loaded Customer Pages
const AllRooms = lazy(() => import("./pages/AllRooms"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const About = lazy(() => import("./pages/About"));
const Experience = lazy(() => import("./pages/Experience"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Profile = lazy(() => import("./pages/Profile"));

// Lazy-loaded Hotel Owner Pages
const Layout = lazy(() => import("./pages/hotelOwner/Layout"));
const Dashboard = lazy(() => import("./pages/hotelOwner/Dashboard"));
const ListRoom = lazy(() => import("./pages/hotelOwner/ListRoom"));
const ManageHotel = lazy(() => import("./pages/hotelOwner/ManageHotel"));
const ScheduleCalendar = lazy(() => import("./pages/hotelOwner/ScheduleCalendar"));
const OwnerReviews = lazy(() => import("./pages/hotelOwner/OwnerReviews"));

// Lazy-loaded Admin Pages
const AdminLayout = lazy(() => import("./pages/admin/Layout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminHotels = lazy(() => import("./pages/admin/AdminHotels"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isOwnerPath = pathname.includes("owner");
  const isAdminPath = pathname.includes("admin");
  const { showHotelRegistration, isAdmin } = useAppContext();
  const { toasts } = useToasterStore();

  // Enforce a strict maximum of 1 visible toast at any time
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, index) => index >= 1)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  useEffect(() => {
    // Admin accounts do not access client pages: redirect straight to admin dashboard
    if (isAdmin && !isAdminPath) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, isAdminPath, navigate]);

  return (
    <div>
      <Toaster />
      {!isOwnerPath && !isAdminPath && <Navbar />}
      {showHotelRegistration && <HotelRegistration />}
      <div className="min-h-[70vh]">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-500 mt-3 font-medium">Đang tải trang...</p>
            </div>
          }
        >
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/about" element={<About />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/loader/:nextUrl" element={<Loader />} />

          {/* Partner / Hotel Owner Routes */}
          <Route path="/owner-dashboard" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<ScheduleCalendar />} />
            <Route path="manage-hotel" element={<ManageHotel />} />
            <Route path="add-room" element={<Navigate to="/owner-dashboard/list-room" replace />} />
            <Route path="list-room" element={<ListRoom />} />
            <Route path="reviews" element={<OwnerReviews />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>
        </Routes>
        </Suspense>
      </div>
      {!isOwnerPath && !isAdminPath && <Footer />}
    </div>
  );
};

export default App;
