import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { InstallBanner } from "./components/InstallBanner";
import { Layout } from "./components/Layout";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { NurseDashboardPage } from "./pages/NurseDashboardPage";
import { NurseProfilePage } from "./pages/NurseProfilePage";
import { NurseRegisterPage } from "./pages/NurseRegisterPage";
import { NursesPage } from "./pages/NursesPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <Toaster richColors position="top-right" />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const nursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nurses",
  component: NursesPage,
  validateSearch: (search: Record<string, unknown>) => ({
    pincode: typeof search.pincode === "string" ? search.pincode : undefined,
  }),
});

const nurseProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nurses/$id",
  component: NurseProfilePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminHiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-hidden-access",
  component: AdminDashboardPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: NurseRegisterPage,
});

const nurseDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/nurse-dashboard",
  component: NurseDashboardPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  nursesRoute,
  nurseProfileRoute,
  adminRoute,
  adminHiddenRoute,
  registerRoute,
  nurseDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function SplashScreen() {
  const isTelugu = localStorage.getItem("hcn_lang") === "te";
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4 px-8 text-center"
      >
        <motion.img
          src="/assets/generated/rural-nurse-care-logo-transparent.dim_400x400.png"
          alt="Home Care Nurse Logo"
          className="w-32 h-32 object-contain drop-shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
        <h1
          className="text-3xl font-bold mt-2"
          style={{ color: "#0056b3", fontFamily: "Inter, sans-serif" }}
        >
          {isTelugu ? "హోమ్ కేర్ నర్స్ కు స్వాగతం" : "Welcome to Home Care Nurse"}
        </h1>
        <div className="mt-4 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-600"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>
      {!showSplash && <RouterProvider router={router} />}
      <InstallBanner />
    </>
  );
}
