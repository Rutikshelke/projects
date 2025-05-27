import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAsync } from "../../stores/actions/authActions";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function useLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [Errors, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const { isLoading, serverError } = useSelector((state) => state.auth);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({ mode: "onBlur" });

    const preparePayload = (data) => ({
        email: data.userEmail.trim(),
        password: data.userPassword,
    });

    const onSubmit = async (data) => {
        setError("");
        setSuccessMessage("");
        const payload = preparePayload(data);

        try {
            const response = await dispatch(loginAsync(payload)).unwrap();
            setSuccessMessage("Login successful!");
            reset();


            setTimeout(() => {
                const rolePathMap = {
                    superadmin: "/superadmin/dashboard",
                    admin: "/admin/dashboard",
                    superdistributor: "/superareamanager/dashboard",
                    distributor: "/areamanager/dashboard",
                    retailer: "/master/dashboard",
                    user: "/",
                };
                // console.log(response.roles);
                // Ensure response.roles exists and is an array
                if (!response || !response.roles) {
                    console.error("Roles data is missing or invalid:", response?.roles);
                    navigate("/auth/login");
                    return;
                }
                if (response.roles) {
                    navigate(rolePathMap[response.roles.toLowerCase()]);
                } else {
                    console.warn("No valid role found, navigating to login.");
                    navigate("/auth/login");
                }
            }, 400);
        } catch (error) {
            setError(error.message || "An error occurred during login.");
        }
    };

    return { register, isLoading, handleSubmit, errors, Errors, onSubmit, serverError, successMessage };
}
