import { CloseIcon } from "@/utils/svgicons";
import React, { useState } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { getImageUrlOfS3 } from "@/utils";
import previmg2 from "@/assets/images/profile.png";
import useSWR from 'swr';
import { getClientAppointments, updateClientReadStatus } from '@/services/client/client-service';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ClinicianDetailsPopupProps {
  isOpen: boolean;
  onRequestClose: () => void;
  therapistId: string;
}

const ClinicianDetailsPopup: React.FC<ClinicianDetailsPopupProps> = ({ 
  isOpen, 
  onRequestClose, 
  therapistId 
}) => {
  const [activeTab, setActiveTab] = useState("tab1");
  const session = useSession();
  const router = useRouter()
  console.log('session:', session);

  // API call to fetch therapist details by ID
  const { data, isLoading, error } = useSWR(
    therapistId ? `/client/therapists/${therapistId}` : null,
    getClientAppointments,
    { revalidateOnFocus: false }
  );

  const therapistData = data?.data.data;
  console.log('therapistData:', therapistData);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

const handleChooseTherapist = async (therapistId: string) => {
    // Validate inputs
    if (!session?.data?.user?.id) {
      alert("Error: User session not found. Please log in again.");
      console.error("User ID is undefined or session is invalid");
      return;
    }

    if (!therapistId) {
      alert("Error: Therapist ID is missing.");
      console.error("Therapist ID is undefined or empty");
      return;
    }

    const payload = { therapistId };

    try {
      const res = await updateClientReadStatus(`/client/assignments/${session.data.user.id}`, payload);
      
      if (res.status === 200) {
        // alert("Therapist selected successfully!");
        router.push("/customer/appointments");
      } else {
        alert(`Error: Failed to select therapist. Status: ${res.status}`);
        console.error("Unexpected status code:", res.status, res.data);
      }
    } catch (error: any) {
      // Handle specific error types
      if (error.response) {
        // Server responded with a status code outside 2xx
        alert(`Error: Failed to select therapist. ${error.response.data?.message || "Server error"}`);
        console.error("API error:", error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response received (e.g., network error)
        alert("Error: Network issue. Please check your connection and try again.");
        console.error("Network error:", error.request);
      } else {
        // Other errors (e.g., client-side error)
        alert("Error: An unexpected error occurred. Please try again.");
        console.error("Unexpected error:", error.message);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Therapist Details"
      className="rounded-lg z-50 w-full max-w-4xl mx-auto bg-white shadow-lg max-h-[90vh] overflow-hidden"
      overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#283C63] p-5 md:py-[25px] md:px-[35px]">
        <div className="flex items-center justify-between">
          <h2 className="font-gothamMedium !text-white">Clinician Details</h2>
          <button onClick={onRequestClose}>
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Sticky Therapist Details */}
      <div className="sticky top-[72px] z-10 bg-white p-5 md:px-[35px]">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <p>Loading therapist details...</p>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-8">
            <p className="text-red-500">Failed to load therapist details.</p>
          </div>
        )}

        {therapistData && (
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center gap-[23px] mb-5 md:mb-10">
              <div>
                <Image 
                  src={therapistData.profilePic ? getImageUrlOfS3(therapistData.profilePic) : previmg2} 
                  height={100} 
                  width={100} 
                  alt="Profile picture" 
                  className="rounded-full w-[100px] object-cover aspect-square" 
                />
              </div>
              <div>
                <h3 className="font-gothamBold">
                  {therapistData.firstName} {therapistData.lastName}
                </h3>
                {/* <p>{therapistData._id}</p> */}
                <p className="text-sm text-gray-600">{therapistData.email}</p>
              </div>
            </div>
            <button 
              className="bg-[#283c63] text-white py-2 px-4 rounded  transition"
              onClick={() => handleChooseTherapist(therapistData.therapistId)}
            >
              Choose therapist
            </button>
          </div>
        )}
      </div>

      {/* Sticky Tabs */}
      <div className="sticky top-[200px] z-10 bg-white  md:px-[35px] border-b border-[#CDE3F1]">
        <div className="mobile-scroll flex justify-start items-center gap-3">
          <button
            className={`font-gothamMedium w-[25%] text-center pb-[15px] px-[5px] text-sm ${
              activeTab === "tab1"
                ? "active !text-[#283c63] border-b-2 border-[#283c63]"
                : ""
            } text-[#969696]`}
            onClick={() => handleTabClick("tab1")}
          >
            Personal Information
          </button>
          <button
            className={`font-gothamMedium w-[25%] text-center pb-[15px] px-[5px] text-sm ${
              activeTab === "tab2"
                ? "active !text-[#283c63] border-b-2 border-[#283c63]"
                : ""
            } text-[#969696]`}
            onClick={() => handleTabClick("tab2")}
          >
            Other Information
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="bg-white md:px-[35px] max-h-[50vh] mb-5 overflow-y-auto">
        {therapistData && (
          <div className="mt-[30px] mb-5">
            {activeTab === "tab1" && (
              <div className="space-y-4 pb-10">
                <h4 className="text-lg font-semibold mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900">{therapistData.firstName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900">{therapistData.lastName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{therapistData.email || 'N/A'}</p>
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900">{therapistData.phoneNumber || 'N/A'}</p>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <p className="text-gray-900">{therapistData.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <p className="text-gray-900">
                      {therapistData.dob ? new Date(therapistData.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <p className="text-gray-900">{therapistData.state || 'N/A'}</p>
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <p className="text-gray-900">{therapistData.zipCode || 'N/A'}</p>
                  </div> */}
                  {/* <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <p className="text-gray-900">
                      {[therapistData.addressLine1, therapistData.addressLine2, therapistData.city, therapistData.country]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </p>
                  </div> */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      therapistData.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {therapistData.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Online Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      therapistData.isOnline 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {therapistData.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <p className="text-gray-900">{therapistData.about || 'No description available'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tab2" && (
              <div className="space-y-6 pb-10">
                <h4 className="text-lg font-semibold mb-4">Other Information</h4>
                <div>
                  <h5 className="text-md font-medium mb-3 text-[#283C63]">Professional Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                      <p className="text-gray-900">{therapistData.currentEmploymentStatus || 'N/A'}</p>
                    </div> */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Hours</label>
                      <p className="text-gray-900">{therapistData.weeklyHours || 'N/A'}</p>
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position</label>
                      <p className="text-gray-900">{therapistData.rolePosition || 'N/A'}</p>
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rate of Pay</label>
                      <p className="text-gray-900">${therapistData.rateOfPay || 'N/A'}</p>
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
                      <p className="text-gray-900">{therapistData.currentOrPreviousEmployerName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor Name</label>
                      <p className="text-gray-900">{therapistData.supervisorName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-md font-medium mb-3 text-[#283C63]">Schedule Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <p className="text-gray-900">{therapistData.startTime || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <p className="text-gray-900">{therapistData.endTime || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Availability</label>
                      <div className="flex flex-wrap gap-2">
                        {therapistData.currentAvailability?.map((day: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {day}
                          </span>
                        )) || <span className="text-gray-500">No availability set</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-md font-medium mb-3 text-[#283C63]">Education Information</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Highest Education</label>
                      <p className="text-gray-900">{therapistData.highestEducationCompleted || 'N/A'}</p>
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                      <p className="text-gray-900">{therapistData.schoolName || 'N/A'}</p>
                    </div> */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Major/Degree</label>
                      <p className="text-gray-900">{therapistData.majorDegree || 'N/A'}</p>
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License/Certification</label>
                      <p className="text-gray-900">{therapistData.licenseOrCertification || 'N/A'}</p>
                    </div> */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                      <p className="text-gray-900">{therapistData.skills || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-md font-medium mb-3 text-[#283C63]">Specialities</h5>
                  <div className="flex flex-wrap gap-2">
                    {therapistData.specialities?.map((speciality: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {speciality}
                      </span>
                    )) || <span className="text-gray-500">No specialities listed</span>}
                  </div>
                </div>
                {/* {therapistData.professionalReferences && therapistData.professionalReferences.length > 0 && (
                  <div>
                    <h5 className="text-md font-medium mb-3 text-[#283C63]">Professional References</h5>
                    <div className="space-y-3">
                      {therapistData.professionalReferences.map((ref: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="font-medium">{ref.name}</p>
                          <p className="text-sm text-gray-600">{ref.email}</p>
                          <p className="text-sm text-gray-600">{ref.phone}</p>
                          <p className="text-sm text-gray-600">{ref.companyPosition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ClinicianDetailsPopup;