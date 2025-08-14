"use client";
import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { TicketTableIcon } from '@/utils/svgicons';
import SearchBar from '@/app/admin/components/SearchBar';
import { getAdminTicketsData, updateAdminTicketsData } from '@/services/admin/admin-service';
import ClientDetailsPopup from '@/app/admin/components/ClientDetailsPopup'; // Add this import
import useSWR from 'swr';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import ReactLoader from '@/components/ReactLoader';

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientDetailsPopup, setClientDetailsPopup] = useState(false); // Add this state
  const [clientDetails, setClientDetails] = useState<any>(null); // Add this state
  const rowsPerPage = 10;
  
  // You might need to get the role from your auth context or props
  const role = 'admin'; // Replace this with your actual role logic

  const query = `page=${currentPage}&limit=${rowsPerPage}&${searchTerm }`;
  const { data, error, isLoading, mutate } = useSWR(`/admin/tickets?${query}`, getAdminTicketsData);
  console.log('data:', data);

  const ticketsData = data?.data?.data?.data;
  const total = data?.data?.data?.total ?? 0;

  const router = useRouter();
  const pageCount = Math.ceil(total / rowsPerPage);

  const handlePageClick = (selectedItem: { selected: number }) => {
    const newPage = selectedItem.selected + 1;
    setCurrentPage(newPage);
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const getStatusColor = (status: 'Pending' | 'Completed'): string => {
    return status === 'Pending' ? 'text-[#A85C03] bg-[#FFFDD1]' : 'text-[#42A803] bg-[#CBFFB2]';
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    id: string
  ) => {
    if (id) {
      const { name, value } = event.target;
      const actionData = {
        [name]: value,
      };
      (async () => {
        try {
          const response = await updateAdminTicketsData(`/admin/tickets/${id}`, actionData);
          if (response.status === 200) {
            toast.success('Client status updated successfully');
            mutate();
          } else {
            toast.error('Failed to update client status');
            console.error('Unexpected response:', response);
          }
        } catch (error) {
          console.error('Error:', error);
          toast.error('Error updating client status');
        }
      })();
    }
  };

  const handleChat = (id: string) => {
    setLoading(true);
    router.push(`/admin/tickets-page/chats/${id}`);
    setLoading(false);
  };

  // Add function to handle client name click
  const handleClientNameClick = (row: any) => {
    setClientDetails(row);
    setClientDetailsPopup(true);
  };

  // Add function to close client popup
  const closeClientPopup = () => {
    setClientDetailsPopup(false);
    setClientDetails(null);
  };

  return (
    <div>
      <h1 className="font-antic text-[#283C63] text-[30px] leading-[1.2em] mb-[25px] lg:text-[40px] lg:mb-[50px]">
        Tickets
      </h1>
      <div className="flex justify-end mb-5">
        <SearchBar setQuery={setSearchTerm} placeholder="Search ticket Id" />
      </div>
      <div className="table-common overflow-custom">
        <table className="w-full">
          <thead>
            <tr className="bg-[#283C63] text-white">
              <th>Ticket Id</th>
              <th>Client Name</th>
              <th>Title</th>
              <th>Created On</th>
              <th>Status</th>
              <th>Chat</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center text-red-500 py-4">
                  Error loading data.
                </td>
              </tr>
            ) : ticketsData?.length > 0 ? (
              ticketsData.map((row: any) => (
                <tr key={row?._id} className="border-b">
                  <td>#{row?.ticketId}</td>
                  <td>
                    {row?.sender?.firstName ? (
                      <button
                        onClick={() => handleClientNameClick(row.sender)}
                        className=" cursor-pointer bg-transparent border-none p-0 font-inherit"
                      >
                        {`${row.sender.firstName} ${row.sender.lastName}`}
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{row?.title || '-'}</td>
                  <td>
                    {row?.createdAt
                      ? new Date(row.createdAt).toLocaleDateString('en-US')
                      : '-'}
                  </td>
                  <td>
                    <p
                      className={`px-[10px] py-[2px] w-20 text-[10px] text-center rounded-3xl ${getStatusColor(
                        row?.status
                      )}`}
                    >
                      {row?.status || '-'}
                    </p>
                  </td>
                  <td>
                    <button onClick={() => handleChat(row?.roomId)}>
                      <TicketTableIcon />
                    </button>
                  </td>
                  <td>
                    <select
                      name="status"
                      value={row?.status || 'Pending'}
                      onChange={(event) => handleInputChange(event, row?._id)}
                      className="w-auto border-none h-auto bg-transparent p-0 pr-4"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="w-full flex justify-center p-3 items-center"
                  colSpan={7}
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {ticketsData?.length > 0 && total > 0 && (
        <div className="text-right mt-4">
          <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={'inline-flex mt-[34px] rounded-[5px] border border-[#d5dce9]'}
            pageClassName={'text-[#26395e]'}
            pageLinkClassName={'py-2 px-4 inline-block'}
            activeClassName={'bg-[#26395e] rounded-[5px] text-white'}
            previousLinkClassName={'py-2 px-4 inline-block'}
            nextLinkClassName={'py-2 px-4 inline-block'}
            disabledClassName={'opacity-50 cursor-not-allowed'}
          />
        </div>
      )}
      
      {/* Client Details Modal */}
      {clientDetails && (
        <ClientDetailsPopup
          isOpen={clientDetailsPopup}
          onRequestClose={closeClientPopup}
          row={clientDetails}
          mutate={mutate}
          role={role}
        />
      )}
      
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 z-50 flex items-center justify-center">
          <ReactLoader />
        </div>
      )}
    </div>
  );
};

export default Page;