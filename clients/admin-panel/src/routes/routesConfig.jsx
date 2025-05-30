
// Authentication
import Login from "../pages/authentication/Login";
import Signup from "../pages/authentication/Signup";
import ForgotPassword from "../pages/authentication/ForgotPassword";
import VerifyEmail from "../pages/authentication/VerifyEmail";
import ResetPassword from "../pages/authentication/ResetPassword";


// Dashboard Routes
import Dashboard from "../pages/dashboard/Dashboard";



// Authentication Routes
export const authenticationRoutes = {
    authentication: [
        { path: "login", element: <Login /> },
        { path: "signup", element: <Signup /> },
        { path: "confirmation/:token", element: <VerifyEmail /> },
        { path: "forgotpassword", element: <ForgotPassword /> },
        { path: "resetPassword/:token", element: <ResetPassword /> },
    ],
};

// Admin Role-Based Routes
export const roleBasedRoutes = {
    admin: [
        // Dashboard
        { path: "dashboard", element: <Dashboard /> },
    ],
};
