import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import MobileNav from './MobileNav';
import { useSocket } from '../../hooks/useSocket';

export default function AppLayout() {
  useSocket();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <TopNav />
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
