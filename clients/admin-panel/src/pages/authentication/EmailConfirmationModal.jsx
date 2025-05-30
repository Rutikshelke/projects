import useEmailConfirmationModal from "../../hooks/Authentication/useEmailConfirmationModal";

const EmailConfirmation = () => {
    const { isRequestLoading, isSuccessfullySend, sendConfirmationEmail } = useEmailConfirmationModal();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-all duration-500">
            <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-4">
                    <span>📬</span>   Email Confirmation
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    To manage your account in the application, it is necessary for you to verify your email address. By pressing the following button, a message will be sent to your email with a verification link valid for 24 hours.
                </p>
                <button
                    onClick={sendConfirmationEmail}
                    disabled={isRequestLoading}
                    className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {isRequestLoading ? "Sending..." : "Confirm Email"}
                </button>

                {isSuccessfullySend && (
                    <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
                        Email confirmation sent successfully!
                    </p>
                )}
            </div>
        </div>
    );
};

export default EmailConfirmation;

