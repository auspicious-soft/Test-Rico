import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { ButtonArrow, ViewIcon } from '@/utils/svgicons';
import ClientsAssignmentPopup from './ClientsAssignmentPopup';
import ReactLoading from 'react-loading';
import UpdateAssignments from './UpdateAssignments';

export interface TableData {
  id: number;
  client: string;
  assignedClinician: string;
  assignedPeerSupport: string;
  status: string;
  message?: string;
  workshop?: string;
  video?: string;
}

interface UnassignedPageProps {
  appointmentsData: any;
  setQuery: any;
  mutate: any;
  isLoading: boolean;
  error: any;
}

const UnassignedClientTable: React.FC<UnassignedPageProps> = ({
  error,
  setQuery,
  appointmentsData,
  mutate,
  isLoading,
}) => {
  const router = useRouter();
  const total = appointmentsData?.total ?? 0;
  const unassignedData = appointmentsData?.data;
  const [currentRow, setCurrentRow] = useState<TableData | null>(null);
  const [formData, setFormData] = useState({
    assignedClinician: '',
    assignedPeerSupport: '',
    message: '',
    workshop: '',
    video: '',
  });
  const [assignmentClientsPopup, setAssignmentClientsPopup] = useState(false);
  const [updateAssignment, setUpdateAssignment] = useState(false);
  const [assignmentDetails, setAssignmentDetails] = useState<{
    id: number;
    client: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0-based for ReactPaginate

  const rowsPerPage = 10;

  // Sync pagination state with URL query parameters on mount
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const page = parseInt(query.get('page') || '1', 10) - 1; // Convert to 0-based for ReactPaginate
    const limit = query.get('limit') || rowsPerPage.toString();
    setCurrentPage(page);
    setQuery(`page=${page + 1}&limit=${limit}`);
  }, [setQuery]);

  const handlePageClick = (selectedItem: { selected: number }) => {
    const newPage = selectedItem.selected;
    const newQuery = `page=${newPage + 1}&limit=${rowsPerPage}`;
    setCurrentPage(newPage);
    setQuery(newQuery);

    // Update the URL without reloading the page
    router.push(`?${newQuery}`, { scroll: false });
  };

  const openAssignmentsPopup = (row: any) => {
    setAssignmentDetails(row);
    setAssignmentClientsPopup(true);
  };

  const closeAssignmentsPopup = () => {
    setAssignmentClientsPopup(false);
    setAssignmentDetails(null); 
  };

  const openModal = (row: any) => {
    setCurrentRow(row);
    setUpdateAssignment(true);
  };


  return (
    <div>
      <div className="table-common overflo-custom">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Assigned Clinician</th>
              <th>Assigned Peer Support</th>
              <th>Plan Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center text-red-500">
                  Error loading data.
                </td>
              </tr>
            ) : unassignedData?.length > 0 ? (
              unassignedData?.map((row: any) => (
                <tr key={row._id}>
                  <td
                    onClick={() => openAssignmentsPopup(row)}
                    className="hover:underline font-bold cursor-pointer"
                  >
                    {row.firstName} {row.lastName}
                  </td>
                  <td>
                    {row.therapistId && row.therapistId.firstName && row.therapistId.lastName
                      ? `${row.therapistId.firstName} ${row.therapistId.lastName}`
                      : 'No Clinician Assigned'}
                  </td>
                  <td className="text-center">
                    {row.planType ? `${row.planType}` : '-'}
                  </td>
                  <td>
                    {row.peerSupportIds && row.peerSupportIds.length > 0 ? (
                      <span>{row.peerSupportIds[0].id}</span>
                    ) : (
                      'No peer supports assigned'
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openModal(row)}
                      className="font-gothamMedium rounded-3xl py-[2px] px-[10px] text-[#26395E] bg-[#CCDDFF] text-[10px]"
                    >
                      Update Assignment
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="w-full flex justify-center p-3 items-center"
                  colSpan={5}
                >
                  {isLoading ? (
                    <ReactLoading
                      type={'spin'}
                      color={'#26395e'}
                      height={'20px'}
                      width={'20px'}
                    />
                  ) : (
                    <p className="text-center">No data found</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {Math.ceil(total / rowsPerPage) > 0 && (
        <div className="text-right">
          <ReactPaginate
            previousLabel={'<'}
            nextLabel={'>'}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={Math.ceil(total / rowsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            forcePage={currentPage} // Ensure the correct page is highlighted
            containerClassName={'inline-flex mt-[34px] rounded-[5px] border border-[#d5dce9]'}
            pageClassName={'text-[#26395e]'}
            pageLinkClassName={'py-2 px-4 inline-block'}
            activeClassName={'bg-[#26395e] rounded-[5px] text-white'}
            previousLinkClassName={'py-2 px-4 inline-block text-[#26395e] border-r border-[#d5dce9]'}
            nextLinkClassName={'py-2 px-4 inline-block text-[#26395e] border-l border-[#d5dce9]'}
          />
        </div>
      )}

      <UpdateAssignments
        isOpen={updateAssignment}
        onRequestClose={() => setUpdateAssignment(false)}
        row={currentRow}
        mutate={mutate}
      />


      {assignmentDetails && (
        <ClientsAssignmentPopup
          isOpen={assignmentClientsPopup}
          onRequestClose={closeAssignmentsPopup}
          row={assignmentDetails}
        />
      )}
    </div>
  );
};

export default UnassignedClientTable;
