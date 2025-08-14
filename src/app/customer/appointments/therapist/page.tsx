'use client';
import React, { useState } from 'react';
import TherapistCard from '../_components/TherapistCard';
import ClinicianDetailsPopup from '../_components/ClinicianDetailsPopup'; // Import the modal component
import useSWR from 'swr'
import { getClientAppointments } from '@/services/client/client-service';
import { useSession } from 'next-auth/react';

const Page = () => {
  const [filters, setFilters] = useState({
    gender: '',
    availability: '',
    specialities: ''
  });
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10'
    });
    
    if (filters.gender) {
      params.append('gender', filters.gender);
    }
    
    if (filters.availability) {
      params.append('currentAvailability', filters.availability);
    }
    
    // Add location filter if your API supports it
    if (filters.specialities) {
      params.append('specialities', filters.specialities);
    }
    
    return `/client/all/therapists?${params.toString()}`;
  };

  const { data, isLoading, error } = useSWR(
    buildQueryString(),
    getClientAppointments,
    { revalidateOnFocus: false }
  );

  const therapists = data?.data?.data?.therapist || [];
  console.log('therapists:', therapists);
  console.log('current filters:', filters);

  const handleFilterChange = (filterType:any, value:any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value === filterType.charAt(0).toUpperCase() + filterType.slice(1) ? '' : value
    }));
  };

  // Modal handlers
  const handleTherapistClick = (therapist: any) => {
    setSelectedTherapist(therapist);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTherapist(null);
  };

  return (
    <>
      {/* Header with filters */}
      <div className="mb-8">
        <h1 className="font-antic text-[#283C63] text-[30px] leading-[1.2em] mb-[25px] lg:text-[40px] lg:mb-[50px]">
          Our Therapists
        </h1>

        {/* Filter buttons */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          <select 
            className="border col-span-1 border-gray-300 rounded px-3 py-2 text-sm bg-[#E7F8F6]"
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
          >
            <option value="">Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select 
            className="border col-span-1 border-gray-300 rounded px-3 py-2 text-sm bg-[#E7F8F6]"
            value={filters.specialities}
            onChange={(e) => handleFilterChange('specialities', e.target.value)}
          >
            <option value="">Specialities</option>
            <option value="depression">Depression</option>
            <option value="stress">Stress</option>
            <option value="Anxiety">Anxiety</option>
            <option value="Trauma/PTSD">Trauma/PTSD</option>
          </select>

          <select 
            className="border col-span-1 border-gray-300 rounded px-3 py-2 text-sm bg-[#E7F8F6]"
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
          >
            <option value="">Availability</option>
            <option value="Mo">Monday</option>
            <option value="Tu">Tuesday</option>
            <option value="We">Wednesday</option>
            <option value="Th">Thursday</option>
            <option value="Fr">Friday</option>
            <option value="Sa">Saturday</option>
            <option value="Su">Sunday</option>
          </select>

          {/* Clear filters button */}
          {/* <button
            className="border col-span-1 border-gray-300 rounded px-3 py-2 text-sm bg-red-100 hover:bg-red-200"
            onClick={() => setFilters({ gender: '', availability: '', location: '' })}
          >
            Clear Filters
          </button> */}
        </div>

        {/* Active filters display */}
        {(filters.gender || filters.availability || filters.specialities) && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.gender && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Gender: {filters.gender}
                  <button 
                    className="ml-1 text-blue-600 hover:text-blue-800"
                    onClick={() => handleFilterChange('gender', '')}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.availability && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Available: {filters.availability}
                  <button 
                    className="ml-1 text-green-600 hover:text-green-800"
                    onClick={() => handleFilterChange('availability', '')}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.specialities && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  Specialities: {filters.specialities}
                  <button 
                    className="ml-1 text-purple-600 hover:text-purple-800"
                    onClick={() => handleFilterChange('specialities', '')}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && <p>Loading therapists...</p>}
      {error && <p className="text-red-500">Failed to load therapists.</p>}

      {/* Results count */}
      {!isLoading && !error && (
        <p className="text-sm text-gray-600 mb-4">
          Found {therapists.length} therapist{therapists.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Therapists grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {therapists.length > 0 ? (
          therapists.map((therapist:any) => (
            <div 
              key={therapist._id}
              onClick={() => handleTherapistClick(therapist.therapistId)}
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            >
              <TherapistCard
                image={'https://cdn-icons-png.flaticon.com/512/847/847969.png'} 
                name={`${therapist.firstName} ${therapist.lastName}`}
                availability={therapist.currentAvailability?.join(', ') || 'N/A'}
                timing={`${therapist.startTime} - ${therapist.endTime}`}
                language={therapist.preferredlanguage || 'Eng'}
              />
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No therapists found matching your criteria.</p>
              <button 
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
                onClick={() => setFilters({ gender: '', availability: '', specialities: '' })}
              >
                Clear all filters
              </button>
            </div>
          )
        )}
      </div>

      {/* Clinician Details Modal */}
      {selectedTherapist && (
        <ClinicianDetailsPopup
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          therapistId={selectedTherapist}
        />
      )}
    </>
  );
};

export default Page;