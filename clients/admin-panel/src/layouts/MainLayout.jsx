import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

function MainLayout() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleLoadComplete = () => setLoading(false);
        const timer = setTimeout(handleLoadComplete, 2000); // Simulate loading time

        return () => clearTimeout(timer); // Cleanup
    }, []);

    return (
        <div>
            <main>
                {loading ? (
                    <p>loading....</p>
                ) : (
                    <Outlet />
                )}
            </main >
        </div>
    );
}

export default MainLayout;
