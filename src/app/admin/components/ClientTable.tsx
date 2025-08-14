"use client";
import { DeleteIcon, ViewIcon } from '@/utils/svgicons';
import { useEffect, useState, useCallback } from 'react';
import Modal from 'react-modal';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import deleteCross from "@/assets/images/deleteCross.png";
import ClientDetailsPopup from './ClientDetailsPopup';
import { deleteClientData, updateClientsDetails } from '@/services/admin/admin-service';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface ClientsDataProps {
  clientsData: any;
  setQuery: any;
  error: any;
  isLoading: any;
  mutate: any;
  role: string;
}

const ClientTable: React.FC<ClientsDataProps> = ({ clientsData, setQuery, error, isLoading, mutate, role }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const total = clientsData?.total ?? 0;
  const ClientsArray = clientsData?.data;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(clientsData);
  const [clientDetailsPopup, setClientDetailsPopup] = useState(false);
  const [clientDetails, setClientDetails] = useState<{ id: string; clientName: string } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for ReactPaginate
  const [isPageLoading, setIsPageLoading] = useState(true); // Track initial page load
  const { data: session } = useSession();

  const rowsPerPage = 10;

  // Sync pagination state with URL query parameters on mount
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10) - 1; // 0-based for ReactPaginate
    const limit = searchParams.get('limit') || rowsPerPage.toString();
    console.log('Initial load - Page:', page, 'Limit:', limit, 'CurrentPage:', currentPage);
    setCurrentPage(page);
    setQuery(`page=${page + 1}&limit=${limit}`);
    setIsPageLoading(false);
  }, [searchParams]); // Only depend on searchParams to avoid resetting on setQuery change

  // Handle page change
  const handlePageClick = useCallback((selectedItem: { selected: number }) => {
    const newPage = selectedItem.selected;
    const newQuery = `page=${newPage + 1}&limit=${rowsPerPage}`;
    console.log('Page clicked - NewPage:', newPage, 'Query:', newQuery);
    setCurrentPage(newPage);
    setQuery(newQuery);
    router.push(`?${newQuery}`, { scroll: false });
  }, [setQuery, router]);

  const openClientPopup = (row: any) => {
    setClientDetails(row);
    setClientDetailsPopup(true);
  };

  const closeClientPopup = () => {
    setClientDetailsPopup(false);
    setClientDetails(null);
  };

  const handleModalClose = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDelete = (id: any) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      const response = await deleteClientData(`/admin/clients/${id}`);
      if (response.status === 200) {
        toast.success("Client deleted successfully");
        setIsDeleteModalOpen(false);
        mutate();
      } else {
        toast.error("Failed to delete Client");
      }
    } catch (error) {
      console.error("Error deleting Client", error);
      toast.error("An error occurred while deleting the Client");
    }
  };

  const handleDeleteCancel = () => {
    handleModalClose();
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    id: string
  ) => {
    if (id) {
      const { name, value } = event.target;
      const updatedRow = { ...ClientsArray.find((client: any) => client._id === id), [name]: value };
      setSelectedRow(updatedRow);
      const actionData = {
        id: updatedRow._id,
        [name]: value,
      };
      try {
        await updateClientsDetails(`/admin/clients/${updatedRow._id}`, actionData);
        toast.success('Client status updated successfully');
        mutate();
      } catch (error) {
        toast.error('Error updating client status');
      }
    }
  };

  // Log clientsData to verify data
  useEffect(() => {
    console.log('ClientsData updated:', clientsData);
  }, [clientsData]);

  return (
    <div className="">
      <div className='table-common overflo-custom'>
        <table className="">
          <thead className="">
            <tr>
              <th>Client</th>
              <th>Status</th>
              <th>Plan Type</th>
              <th>Member Since</th>
              <th>Assignments</th>
              <th>Action</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {isLoading || isPageLoading ? (
              <tr>
                <td colSpan={7} className="">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="text-center text-red-500">Error loading clients data.</td>
              </tr>
            ) : ClientsArray?.length > 0 ? (
              ClientsArray?.map((row: any) => (
                <tr key={row?._id} className="border-b">
                  <td
                    className='hover:underline hover:font-bold cursor-pointer'
                    onClick={() => openClientPopup(row)}
                  >
                    {row?.firstName} {row?.lastName}
                  </td>
                  <td>
                    <p
                      className={`font-gothamMedium rounded-3xl py-[2px] px-[10px] text-[10px] text-center 
                      ${row?.status === 'Active Client' ? 'text-[#155724] bg-[#D4EDDA]' : 'text-[#5E2626] bg-[#FFCCCC]'}`}
                    >
                      {row?.status === 'Active Client' ? 'Active Client' : row?.status}
                    </p>
                  </td>
                  <td>{row?.planType ? row?.planType : "-"}</td>
                  <td>{new Date(row?.createdAt).toLocaleDateString('en-US')}</td>
                  <td>{row?.appointments.length}</td>
                  <td>
                    <select
                      name="status"
                      value={row?.status}
                      onChange={(event) => handleInputChange(event, row?._id)}
                      className="w-[280px] border-none h-auto bg-transparent pl-2"
                    >
                      <option value="Active Client">Active Client</option>
                      <option value="Pending">Pending</option>
                      <option value="Callback Pending">Callback Pending</option>
                      <option value="Insurance Verified">Insurance Verified</option>
                      <option value="Pending Clinical Review">Pending Clinical Review</option>
                      <option value="Waiting Assignment">Waiting Assignment</option>
                      <option value="Assessment Pending">Assessment Pending</option>
                      <option value="Assessment Scheduled">Assessment Scheduled</option>
                      <option value="Insurance Hold">Insurance Hold</option>
                      <option value="Ineligible Due to insurance">Ineligible Due to insurance</option>
                      <option value="Alert -SEE NOTES">Alert -SEE NOTES</option>
                      <option value="Alert - Past Due Balance/Collection">Alert - Past Due Balance/Collection</option>
                      <option value="Unresponsive - Week 1">Unresponsive - Week 1</option>
                      <option value="Unresponsive - Week 2">Unresponsive - Week 2</option>
                      <option value="Unresponsive - Week 3">Unresponsive - Week 3</option>
                      <option value="Unresponsive - Week 4">Unresponsive - Week 4</option>
                      <option value="No Contact Sent">No Contact Sent</option>
                      <option value="Inactive - Discharged">Inactive - Discharged</option>
                      <option value="Inactive - Unresponsive">Inactive - Unresponsive</option>
                      <option value="Inactive - Bad Lead">Inactive - Bad Lead</option>
                      <option value="Inactive - Referred Out">Inactive - Referred Out</option>
                      <option value="Inactive - Not Interested">Inactive - Not Interested</option>
                      <option value="Intake Pending">Intake Pending</option>
                      <option value="Intake Complete">Intake Complete</option>
                    </select>
                  </td>
                  <td className="py-2 px-4">
                    <div className='text-center'>
                      <button
                        disabled={(session as any)?.user?.role !== 'admin'}
                        onClick={() => handleDelete(row?._id)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className='w-full flex justify-center p-3 items-center' colSpan={7}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {Math.ceil(total / rowsPerPage) > 0 && (
        <div className="text-right mt-4">
          <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            pageCount={Math.ceil(total / rowsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            forcePage={currentPage} // Ensure the correct page is highlighted
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

      {clientDetails && (
        <ClientDetailsPopup
          isOpen={clientDetailsPopup}
          onRequestClose={closeClientPopup}
          row={clientDetails}
          mutate={mutate}
          role={role}
        />
      )}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={handleModalClose}
          contentLabel="Delete Item"
          className="rounded-lg w-full p-14 max-w-4xl mx-auto bg-white shadow-lg max-h-[90vh] overflow-auto"
          overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
        >
          <Image src={deleteCross} alt='delete' height={174} width={174} className="mx-auto" />
          <h2 className="text-[20px] text-center leading-normal mt-[-20px]">Are you sure you want to Delete?</h2>
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              type="button"
              onClick={() => handleDeleteConfirm(deleteId as string)}
              className="py-[10px] px-8 bg-[#CC0000] text-white rounded"
            >
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={handleDeleteCancel}
              className='py-[10px] px-8 bg-[#283C63] text-white rounded'
            >
              No
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientTable;