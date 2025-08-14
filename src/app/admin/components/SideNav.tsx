

"use client";
import { useState } from "react";
import { usePathname } from 'next/navigation';
import { AddClientIcon, AssignmentIcon, CallIcon, ClientIcon, ClientWellIcon, ClinicianIcon, DashboardIcon, Humbruger, Logo, NewClinicianIcon, PaymentIcon, TaskIcon, LogOut, TicketsIcon } from "@/utils/svgicons";
import Link from "next/link";
import './SideNav.css';
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

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
              <Link href="/admin/dashboard">
                <Logo />
              </Link>
            </div>
          )}
          <button onClick={toggleSidebar} className="hamburgerButton">
            <Humbruger />
          </button>
        </div>
        <ul className="navList">
          <li className={isActive('/admin/dashboard')}>
            <Link href="/admin/dashboard">
              <DashboardIcon />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </li>
          <li className={isActive('/admin/appointments')}>
            <Link href="/admin/appointments">
              <TaskIcon />
              {!isCollapsed && <span>Appointments</span>}
            </Link>
          </li>
          <li className={isActive('/admin/assignments')}>
            <Link href="/admin/assignments">
              <AssignmentIcon />
              {!isCollapsed && <span>Assignments</span>}
            </Link>
          </li>
          <li className={isActive('/admin/clinician')}>
            <Link href="/admin/clinician">
              <ClinicianIcon />
              {!isCollapsed && <span>Clinician</span>}
            </Link>
          </li>
          <li className={isActive('/admin/new-clinician')}>
            <Link href="/admin/new-clinician">
              <NewClinicianIcon />
              {!isCollapsed && <span>Add New Clinician</span>}
            </Link>
          </li>
          <li className={isActive('/admin/client-page')}>
            <Link href="/admin/client-page">
              <ClientIcon />
              {!isCollapsed && <span>Clients</span>}
            </Link>
          </li>
          <li className={isActive('/admin/addnew-client')}>
            <Link href="/admin/addnew-client">
              <AddClientIcon />
              {!isCollapsed && <span>Add New Client</span>}
            </Link>
          </li>
          <li className={isActive('/admin/client-wellness')}>
            <Link href="/admin/client-wellness">
              <ClientWellIcon />
              {!isCollapsed && <span>Client Wellness</span>}
            </Link>
          </li>
          <li className={isActive('/admin/add-users')}>
            <Link href="/admin/add-users">
              <AddClientIcon />
              {!isCollapsed && <span>Add Users</span>}
            </Link>
          </li>
          <li className={isActive('/admin/payment-request')}>
            <Link href="/admin/payment-request">
              <PaymentIcon />
              {!isCollapsed && <span>Payment Requests</span>}
            </Link>
          </li>
          <li className={isActive('/admin/view-task')}>
            <Link href="/admin/view-task">
              <TaskIcon />
              {!isCollapsed && <span>View Tasks</span>}
            </Link>
          </li>
          <li className={`${isActive('/admin/tickets-page')} ${pathname.startsWith('/admin/tickets-page/chat') ? 'active' : ''}`}>
            <Link href="/admin/tickets-page">
              <TicketsIcon />
              {!isCollapsed && <span>Tickets</span>}
            </Link>
          </li>
        </ul>
      </div>
      <div className="">
        <ul className="navList">
          <li className="!m-0 cursor-pointer flex items-center gap-2" onClick={handleLogoutClick}>
            <LogOut />
            {!isCollapsed && <span className="text-[#283C63] text-[600]">Log Out</span>}
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