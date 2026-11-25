import React, { useEffect, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import HotelRegistration from "./components/HotelRegistration";
import RouteErrorBoundary from "./components/RouteErrorBoundary";
import { Toaster, toast, useToasterStore } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import Loader from "./components/Loader";

// Resilient React.lazy wrapper that retries once via reload if Vite chunk cache is stale
const lazyWithRetry = (importer, chunkName) =>
  lazy(async () => {
    const key = `homestay_lazy_retry_${chunkName}`;
    try {
      const mod = await importer();
      try {
        sessionStorage.removeItem(key);
      } catch {
        // ignore storage restrictions
      }
      return mod;
    } catch (error) {
      let alreadyRetried = false;
      try {
        alreadyRetried = Boolean(sessionStorage.getItem(key));
        if (!alreadyRetried) {
          sessionStorage.setItem(key, "1");
        }
      } catch {
        alreadyRetried = true;
      }

      if (!alreadyRetried) {
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });

// Lazy-loaded Customer Pages
const AllRooms = lazyWithRetry(() => import("./pages/AllRooms"), "AllRooms");
const RoomDetails = lazyWithRetry(() => import("./pages/RoomDetails"), "RoomDetails");
const About = lazyWithRetry(() => import("./pages/About"), "About");
const Experience = lazyWithRetry(() => import("./pages/Experience"), "Experience");
const MyBookings = lazyWithRetry(() => import("./pages/MyBookings"), "MyBookings");
const Profile = lazyWithRetry(() => import("./pages/Profile"), "Profile");
const Blog = lazyWithRetry(() => import("./pages/Blog"), "Blog");
const HostPartners = lazyWithRetry(() => import("./pages/HostPartners"), "HostPartners");
const HelpCenter = lazyWithRetry(() => import("./pages/HelpCenter"), "HelpCenter");
const DataProtection = lazyWithRetry(() => import("./pages/DataProtection"), "DataProtection");
const CancellationPolicy = lazyWithRetry(() => import("./pages/CancellationPolicy"), "CancellationPolicy");
const Contact = lazyWithRetry(() => import("./pages/Contact"), "Contact");
const CommunityGuidelines = lazyWithRetry(() => import("./pages/CommunityGuidelines"), "CommunityGuidelines");
const VnpayReturn = lazyWithRetry(() => import("./pages/VnpayReturn"), "VnpayReturn");
const VnpaySandboxMock = lazyWithRetry(() => import("./pages/VnpaySandboxMock"), "VnpaySandboxMock");

// Lazy-loaded Hotel Owner Pages
const Layout = lazyWithRetry(() => import("./pages/hotelOwner/Layout"), "OwnerLayout");
const Dashboard = lazyWithRetry(() => import("./pages/hotelOwner/Dashboard"), "OwnerDashboard");
const ListRoom = lazyWithRetry(() => import("./pages/hotelOwner/ListRoom"), "ListRoom");
const ManageHotel = lazyWithRetry(() => import("./pages/hotelOwner/ManageHotel"), "ManageHotel");
const ScheduleCalendar = lazyWithRetry(() => import("./pages/hotelOwner/ScheduleCalendar"), "ScheduleCalendar");
const OwnerReviews = lazyWithRetry(() => import("./pages/hotelOwner/OwnerReviews"), "OwnerReviews");

// Lazy-loaded Admin Pages
const AdminLayout = lazyWithRetry(() => import("./pages/admin/Layout"), "AdminLayout");
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"), "AdminDashboard");
const AdminUsers = lazyWithRetry(() => import("./pages/admin/AdminUsers"), "AdminUsers");
const AdminHotels = lazyWithRetry(() => import("./pages/admin/AdminHotels"), "AdminHotels");
const AdminCategories = lazyWithRetry(() => import("./pages/admin/AdminCategories"), "AdminCategories");
const AdminReviews = lazyWithRetry(() => import("./pages/admin/AdminReviews"), "AdminReviews");

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

  // Scroll window to top whenever route pathname changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

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
        <RouteErrorBoundary resetKey={pathname}>
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
              <Route path="/blog" element={<Blog />} />
              <Route path="/host-partners" element={<HostPartners />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/privacy-policy" element={<DataProtection />} />
              <Route path="/cancellation-policy" element={<CancellationPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              <Route path="/payment/vnpay-return" element={<VnpayReturn />} />
              <Route path="/payment/vnpay-sandbox" element={<VnpaySandboxMock />} />
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
        </RouteErrorBoundary>
      </div>
      {!isOwnerPath && !isAdminPath && <Footer />}
    </div>
  );
};

export default App;
