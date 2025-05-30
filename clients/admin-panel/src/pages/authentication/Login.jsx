import { Link } from 'react-router-dom';
import useLogin from '../../hooks/Authentication/useLogin';
import { motion } from 'framer-motion';
import { useState } from "react";


export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { register, isLoading, handleSubmit, errors, onSubmit, serverError, successMessage } = useLogin();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-gray-100 dark:bg-gray-900">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    {/* Centered Logo and Heading */}
                    <div className="flex flex-col items-center justify-center text-center">

                        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Login
                        </h2>
                    </div>

                    {/* Login Form */}
                    <form className="space-y-6 mt-8" onSubmit={handleSubmit(onSubmit)}>
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <input
                                id="userEmail"
                                name="userEmail"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="userPassword"
                                    name="userPassword"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    placeholder="Password"
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

                        {/* Forgot Password */}
                        <div className="flex items-center justify-between">
                            <Link to="/authentication/forgotpassword" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                                Forgot password?
                            </Link>
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
                                {isLoading ? "Signing in..." : "Sign in"}
                            </motion.button>
                        </div>
                    </form>

                    {/* Server Messages */}
                    {serverError && (
                        <p className="mt-2 text-center text-sm text-red-600">{serverError}</p>
                    )}
                    {successMessage && (
                        <p className="mt-2 text-center text-sm text-green-600">{successMessage}</p>
                    )}

                    {/* Signup Redirect */}
                    <div className="text-center mt-4">
                        <Link to="/authentication/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                            Don&apos;t have an account? Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
