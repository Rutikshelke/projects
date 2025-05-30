import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react';
import { getSessionAsync } from "../../stores/actions/authActions";

const useSession = () => {
    const dispatch = useDispatch();

    const {
        isLoading,
        isLoggedIn,
        user,
        token,
        roles,
        isAdmin,
        isUser,
        isCustomer,
        isModerator,
        error,
    } = useSelector((state) => state.auth);

    // Only fetch session data if user is not already present
    useEffect(() => {
        if (!user) {
            dispatch(getSessionAsync());
        }
    }, [user, dispatch]);

    return {
        isLoading,
        isLoggedIn,
        user,
        token,
        roles,
        isAdmin,
        isUser,
        isCustomer,
        isModerator,
        error,
    };
};

export default useSession;
