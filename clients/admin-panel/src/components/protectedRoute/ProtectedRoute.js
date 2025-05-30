import { Navigate, Outlet } from "react-router-dom";
import { getCookie } from "../../utils/authUtils"

import useSession from "../../hooks/Authentication/useSession";
export const ProtectedRoute = ({ element: Layout, requiredRoles }) => {
    const { user } = useSession()
    // const token = sessionStorage.getItem("authToken");
    const tokenExpiration = getCookie('session-token');
    const currentTime = new Date().getTime();
    const redirectTo = "/authentication/login";
    // Redirect if no token or token expired
    // if (!tokenExpiration || currentTime > tokenExpiration) {
    //     sessionStorage.clear();
    //     return <Navigate to={redirectTo} replace />;
    // }
    // // Redirect if no user or invalid user data
    // if (!user || Array.isArray(user)) {
    //     return <Navigate to={redirectTo} replace />;
    // }
    // // Redirect if user doesn't have required role
    // if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    //     return <Navigate to={`/${user.role}/dashboard`} replace />;
    // }

    // Render the Layout with children
    return <Layout><Outlet /></Layout>;
};


export const ProtectedAuthRoute = ({ element: Layout }) => {
    const { user } = useSession()
    const tokenExpiration = getCookie('session-token');
    // if (tokenExpiration && user) {
    //     return <Navigate to={`/${user.role}/dashboard`} replace />;
    // }
    // Else → allow to access login/signup/etc.
    return <Layout><Outlet /></Layout>;
};
