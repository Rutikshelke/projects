import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Authentication Pages
import Login from "./pages/authentication/Login";
import Signup from "./pages/authentication/Signup";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import VerifyEmail from "./pages/authentication/VerifyEmail";
import ResetPassword from "./pages/authentication/ResetPassword";

// Layouts
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";

// Toast and Protected Route
import ToastContainers from "./components/toast/ToastContainer";
import { ProtectedRoute, ProtectedAuthRoute } from "./components/protectedRoute/ProtectedRoute";

// Routes Config
import { roleBasedRoutes } from "./routes/routesConfig";

// 🔹 Function to Render Role-Based Routes
const renderRoleRoutes = (role, Layout) => {
  if (!role || !roleBasedRoutes[role]) {
    console.error(`No routes found for role: ${role}`);
    return null;
  }
  return (
    <Route
      path={`${role}/*`}
      element={<ProtectedRoute element={Layout} requiredRoles={[role]} />}
    >
      {roleBasedRoutes[role].map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      {/* Redirect to Dashboard if unknown route */}
      <Route path="*" element={<Navigate to={`/${role}/dashboard`} replace />} />
    </Route>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Default redirect to login */}
        <Route path="/" element={<Navigate to="/authentication/login" replace />} />

        {/* 🔹 Auth Routes */}
        <Route path="authentication/*" element={<ProtectedAuthRoute element={AuthLayout} />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="confirmation/:token" element={<VerifyEmail />} />
          <Route path="forgotpassword" element={<ForgotPassword />} />
          <Route path="resetPassword/:token" element={<ResetPassword />} />
        </Route>

        {/* 🔹 Admin Role Routes */}
        {renderRoleRoutes("admin", AdminLayout)}

        {/* 🔹 Catch-all fallback */}
        <Route path="*" element={<Navigate to="/authentication/login" replace />} />
      </Routes>

      {/* Toasts */}
      <ToastContainers />
    </Router>
  );
}
