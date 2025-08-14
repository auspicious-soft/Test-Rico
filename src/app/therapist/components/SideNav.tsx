"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import { DashboardIcon, Humbruger, Logo, LogOut, BillingIcon, PasswordIcon, PaymentHistoryIcon, PayRequestIcon, AssignIcon, OverviewIcon5, OverviewIcon9, TrainingIcon } from "@/utils/svgicons";
import Link from "next/link";
import './SideNav.css';
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Calendar, CalendarIcon } from "lucide-react";

const SideNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path: string) => pathname === path ? 'active' : '';

  const handleLogoutClick = () => {
    setIsModalOpen(true); // Open the modal on logout click
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div className={`sideNav ${isCollapsed ? 'collapsed' : ''} h-[100%] overflow-custom`}>
      <div className="">
        <div className="header min-h-[46px] justify-between gap-[10px]">
          {!isCollapsed && (
            <div className="logoContainer">
              <Link href="/therapist/dashboard">
                <Logo />
              </Link>
            </div>
          )}
          <button onClick={toggleSidebar} className="hamburgerButton">
            <Humbruger />
          </button>
        </div>
        <ul className="navList">
          <li className={isActive('/therapist/dashboard')}>
            <Link href="/therapist/dashboard">
              <DashboardIcon />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive('/therapist/training')}>
            <Link href="/therapist/training">
              <TrainingIcon />
              {!isCollapsed && <span>Training</span>}
            </Link>
          </li>
          <li className={isActive('/therapist/calender')}>
            <Link href="/therapist/calender">
              <AssignIcon />
              {!isCollapsed && <span>Calender</span>}
            </Link>
          </li>
          <li className={`${isActive('/therapist/assignments')} ${pathname.startsWith('/therapist/assignments/chat') ? 'active' : ''}`}>
            <Link href="/therapist/assignments">
              <AssignIcon />
              {!isCollapsed && <span>Appointments</span>}
            </Link>
          </li>
          <li className={isActive('/therapist/my-clients')}>
            <Link href="/therapist/my-clients">
              <PasswordIcon />
              {!isCollapsed && <span>My Clients</span>}
            </Link>
          </li>
          <li className={isActive('/therapist/payment-history')}>
            <Link href="/therapist/payment-history">
              <PaymentHistoryIcon />
              {!isCollapsed && <span>Payment History</span>}
            </Link>
          </li>
          <li className={isActive('/therapist/profile')}>
            <Link href="/therapist/profile">
              <PasswordIcon />
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </li>
          <li className={isActive('/therapist/view-task')}>
            <Link href="/therapist/view-task">
              <BillingIcon />
              {!isCollapsed && <span>View Task</span>}
            </Link>
          </li>
        </ul>
      </div>
      <div className="">
        <ul className="navList">
          <li className="!m-0">
            <a onClick={handleLogoutClick} style={{ cursor: 'pointer' }}>
              <LogOut />
              {!isCollapsed && <span className="text-[#283C63] text-[600]">Log Out</span>}
            </a>
          </li>
        </ul>
      </div>

      {/* Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  closeModal();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideNav;