import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import useSignupForm from "../../hooks/Authentication/useSignupForm";

export default function Signup() {
    const [showPassword, setShowPassword] = useState(false);
    const { register, isLoading, handleSubmit, errors, onSubmit, serverError, successMessage } = useSignupForm();


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full space-y-8"
            >
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>

                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        {/* First Name */}
                        <div>
                            <label htmlFor="userFirstName" className="sr-only">
                                First Name
                            </label>
                            <input
                                id="userFirstName"
                                name="userFirstName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="First Name"
                                {...register('userFirstName', {
                                    required: "First name is required",
                                    pattern: {
                                        value: /^[A-Za-zñÑáÁéÉíÍóÓúÚÜü]+$/,
                                        message: "Invalid first name"
                                    }
                                })}
                            />
                            {errors.userName && (
                                <p className="text-red-500 text-sm">{errors.userName.message}</p>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label htmlFor="userLastName" className="sr-only">
                                Last Name
                            </label>
                            <input
                                id="userLastName"
                                name="userLastName"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Last Name"
                                {...register('userLastName', {
                                    required: "Last name is required",
                                    pattern: {
                                        value: /^[A-Za-zñÑáÁéÉíÍóÓúÚÜü]+$/,
                                        message: "Invalid last name"
                                    }
                                })}
                            />
                            {errors.userLastName && (
                                <p className="text-red-500 text-sm">{errors.userLastName.message}</p>
                            )}
                        </div>

                        {/* Email Address */}
                        <div>
                            <label htmlFor="userEmail" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="userEmail"
                                name="userEmail"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="Email address"
                                {...register('userEmail', {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$/,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.userEmail && (
                                <p className="text-red-500 text-sm">{errors.userEmail.message}</p>
                            )}
                        </div>

                        {/*mobile number */}
                        <div>
                            <label htmlFor="userMobile" className="sr-only">
                                mobile
                            </label>
                            <input
                                id="userMobile"
                                name="userMobile"
                                type="mobile"
                                autoComplete="mobile"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                placeholder="mobile number"
                                {...register('userMobile', {
                                    required: "Mobile number is required",
                                    pattern: {
                                        value: /^[6-9]\d{9}$/,
                                        message: "Enter a valid 10-digit mobile number"
                                    }
                                })}
                            />
                            {errors.userMobile && (
                                <p className="text-red-500 text-sm">{errors.userMobile.message}</p>
                            )}
                        </div>
                        {/* Password */}
                        <div>
                            <label htmlFor="userPassword" className="sr-only">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="userPassword"
                                    name="userPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Password"
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                    {...register('userPassword', {
                                        required: "Password is required",
                                        minLength: {
                                            value: 5,
                                            message: "Password must be at least 5 characters"
                                        }
                                    })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 focus:outline-none"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.userPassword && (
                                <p className="text-red-500 text-sm">{errors.userPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing up...' : 'Sign up'}
                        </motion.button>
                    </div>
                </form>
                {/* Loading Indicator */}
                {/* {isFormLoading && <p className="text-center text-gray-600">Loading...</p>} */}
                {/* Error Message */}
                {/* Feedback Messages */}
                {serverError && (
                    <p className="mt-2 text-center text-sm text-red-600">{serverError}</p>
                )}
                {successMessage && (
                    <p className="mt-2 text-center text-sm text-green-600">{successMessage}</p>
                )}
                {/* Link to login page */}
                <div className="text-center">
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        Already have an account? Sign in
                    </Link>
                </div>
            </motion.div>
        </div >
    );
}


