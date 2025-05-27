import React from 'react'

function OperatorLayouts() {
    return (
        <div className="flex h-screen overflow-hidden  bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="w-full flex flex-1 flex-col">
                <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23]">

                </header>
                <main className="flex-1 overflow-auto scrollable-content p-5 bg-white dark:bg-[#0F0F12]">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
export default OperatorLayouts;