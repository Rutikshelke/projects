import { Outlet } from 'react-router-dom';
import SidebarLayout from '../components/layouts/sidebar/SidebarLayout';

function AdminLayout() {
    return (

        <div className="flex w-full min-h-screen dark:bg-darkgray">
            <div className="page-wrapper flex w-full  ">
                {/* Header/sidebar */}
                <SidebarLayout />
                <main className="flex-1 overflow-auto scrollable-content p-5 bg-white dark:bg-[#0F0F12]">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export default AdminLayout;