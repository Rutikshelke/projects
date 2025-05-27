import { useParams } from "react-router-dom";
import { useEmailVerification } from "../../hooks/Authentication/useEmailVerification";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";


// export const EmailVerificationPage = () => {
//     const { token } = useParams(); // Extract token from URL

//     const { isLoading, isVerificationSuccessful, serverError } = useEmailVerification(token);

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="max-w-md p-8 bg-white rounded-lg shadow-md text-center">
//                 <h1 className="text-2xl font-bold mb-6 text-gray-800">Email Verification</h1>

//                 {isLoading && (
//                     <>
//                         <p className="text-center text-gray-600 dark:text-gray-300">
//                             Verifying your email...
//                         </p>
//                     </>
//                 )}
//                 {serverError && (
//                     <>
//                         <p className="text-center text-red-600 dark:text-red-400">
//                             {serverError}
//                         </p>
//                     </>
//                 )}
//                 {isVerificationSuccessful && (
//                     <>
//                         <p className="text-center text-green-600 dark:text-green-400">
//                             Email successfully verified! You can log in now.
//                         </p>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };




export default function VerifyEmail() {
    const { token } = useParams(); // Extract token from the URL
    console.log("Token:", token); // Make sure the token is available

    // Assuming useEmailVerification is a custom hook
    const { isLoading, isVerificationSuccessful, serverError } = useEmailVerification(token);

    useEffect(() => {
        document.title = isLoading ? "Verifying Email..." : "Email Verification";
    }, [isLoading]);
    console.log("Verification state:", { isLoading, isVerificationSuccessful, serverError });

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
            <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                    Email Verification
                </h1>

                {isLoading ? (
                    // Loading Animation
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-4"
                    >
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </motion.div>
                ) : isVerificationSuccessful ? (
                    // Success Animation
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="inline-block mb-4"
                    >
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </motion.div>
                ) : (
                    // Failure Animation
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="inline-block mb-4"
                    >
                        <XCircle className="w-16 h-16 text-red-500" />
                    </motion.div>
                )}

                {/* Verification Message */}
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                    {isLoading
                        ? "Verifying your email..."
                        : isVerificationSuccessful
                            ? "Your email has been successfully verified!"
                            : serverError || "Email verification failed. Please try again."}
                </p>

                {/* Action Button */}
                {isVerificationSuccessful ? (
                    <a
                        href="/login"
                        className="block w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
                    >
                        Proceed to Login
                    </a>
                ) : !isLoading ? (
                    <a
                        href="/signup"
                        className="block w-full px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                    >
                        Retry or Sign Up
                    </a>
                ) : null}
            </div>
        </div>
    );
}