"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import { AssignmentIcon, BillingInsuranceIcon, ChangePasswordIcon, DashboardIcon, HelpCenterIcon, Humbruger, Logo, LogOut, PlansIcon, ProfileIcon, WellnessIcon } from "@/utils/svgicons";
import Link from "next/link";
import './SideNav.css';
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import VideoLogo from "./VideoLogo";

const SideNav = () => {
  const router = useRouter();

  const handleLogout = async () => {
    router.push('/login');
    await signOut({ redirect: false })
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const pathname = usePathname();
  const handleLogoutClick = () => {
    setIsModalOpen(true); // Open the modal on logout click
  };
  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const isActive = (path: string) => pathname === path ? 'active' : '';

  return (
    <div className={`sideNav ${isCollapsed ? 'collapsed' : ''} h-[100%] overflo-custom z-[200]`}>
      <div className="">
        <div className="header min-h-[46px] justify-between gap-[10px]">
          {!isCollapsed && (
            <div className="logoContainer">
              <Link href="/customer/dashboard">
                <Logo />
              </Link>
            </div>
          )}
          <button onClick={toggleSidebar} className="hamburgerButton">
            <Humbruger />
          </button>
        </div>
        <ul className="navList">
          <li className={isActive('/customer/dashboard')}>
            <Link href="/customer/dashboard">
              <DashboardIcon />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive('/customer/wellness')}>
            <Link href="/customer/wellness">
              <WellnessIcon />
              {!isCollapsed && <span>Wellness</span>}
            </Link>
          </li>
              <li className={`${isActive('/customer/appointments')} ${pathname.startsWith('/customer/appointments/chat') ? 'active' : ''}`}>
              <Link href="/customer/appointments">
                <AssignmentIcon />
                {!isCollapsed && <span>Appointments</span>}
              </Link>
              </li>
          <li className={isActive('/customer/profile')}>
            <Link href="/customer/profile">
              <ProfileIcon />
              {!isCollapsed && <span>Profile</span>}
            </Link>
          </li>
          <li className={isActive('/customer/change-password')}>
            <Link href="/customer/change-password">
              <ChangePasswordIcon />
              {!isCollapsed && <span>Change Password</span>}
            </Link>
          </li>
          <li className={isActive('/customer/billing-insurance')}>
            <Link href="/customer/billing-insurance">
              <BillingInsuranceIcon />
              {!isCollapsed && <span>Billing & Insurance</span>}
            </Link>
          </li>
          <li className={`${isActive('/customer/help-center')} ${pathname.startsWith('/customer/help-center/chat') ? 'active' : ''}`}>
            <Link href="/customer/help-center">
              <HelpCenterIcon />
              {!isCollapsed && <span>Help Center</span>}
            </Link>
          </li>
        </ul>

        {/* How to Book a Session Card */}
        {!isCollapsed && (
          <div className="mx-4 mt-6 mb-4">
            <div className="bg-gradient-to-br from-blue-50 text-center to-purple-50 rounded-xl p-4 border border-blue-100">
            
              <div className="mb-3">            
                  <VideoLogo/>               
              </div>
              
           
              <h3 className="text-base font-semibold text-[#283C63] text-center mb-2">
                How to Book a Session
              </h3>
              
             
              <p className="text-sm text-[#686C78] text-center mb-4 leading-relaxed">
                Confused about how to book your appointment?
              </p>
         
              <Link href='/customer/how-to-book-appointment' className="w-full bg-[#283C63] hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm">
                Watch Video
              </Link>
            </div>
          </div>
        )}
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
                  closeModal();
                  handleLogout();
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