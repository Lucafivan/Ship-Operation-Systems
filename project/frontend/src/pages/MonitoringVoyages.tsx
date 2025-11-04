import React from "react";
import Modal from "../components/modals";
import EditContainerMovementModal from "../components/modals/EditContainerMovementModal";
import VoyageForm from "../components/form/voyagesform";
import { useMonitoringVoyages } from "../hooks/useMonitoringVoyages";
import type { DatePreset } from "./monitoring.types";
import CMHeader from "../components/monitoring/CMHeader";
import CMRow from "../components/monitoring/CMRow";
import CostHeader from "../components/monitoring/CostHeader";

const MonitoringVoyages: React.FC = () => {
  const {
    isModalOpen, setIsModalOpen,
    loading,
    currentPage, setCurrentPage,
    totalPages, totalRecords,
    showCost, setShowCost,
    estimations,
    useAllPagesForSearch, allData, allLoaded, loadingAll,
    perPage, setPerPage,
    datePreset, setDatePreset, customStart, setCustomStart, customEnd, setCustomEnd,
    sortConfig, requestSort,
    isEditOpen, editingRow,
    searchKey, setSearchKey, searchText, setSearchText,
    finalData,
    fetchData,
    openEdit, closeEdit,
  } = useMonitoringVoyages();

  const MAX_VISIBLE_ROWS = 8;
  const BODY_ROW_APPROX_PX = 50;
  const HEADER_STACK_PX = 180;
  const maxBodyHeight = `calc(${HEADER_STACK_PX}px + ${BODY_ROW_APPROX_PX * MAX_VISIBLE_ROWS}px)`;
  const COST_HEADER_PX = 48;
  const maxCostHeight = `calc(${COST_HEADER_PX}px + ${BODY_ROW_APPROX_PX * MAX_VISIBLE_ROWS}px)`;

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchData(1);
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-50 font-semibold">Memuat Monitoring Voyages…</div>
    );

  return (
    <>
      <div className="overflow-x-auto">
        <h1 className="text-2xl font-semibold mb-4 text-gray-50">
          Monitoring Voyages
        </h1>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col px-1">
              <label className="text-xs text-white">Date Filter</label>
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none"
              >
                <option value="all">All</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {datePreset === "custom" && (
              <>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">Start</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-slate-600">End</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            <button
              onClick={() => {
                setDatePreset("all");
                setCustomStart("");
                setCustomEnd("");
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow hover:bg-slate-200"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-3 px-1 md:flex-row md:items-end">
            {/* Search controls */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-2">
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow hover:bg-slate-200"
                  type="button"
                >
                  Clear
                </button>
              )}
              <div className="flex flex-col">
                <label className="text-xs text-white">Cari</label>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Kata Kunci"
                  className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-white">Pilih Kolom</label>
                <select
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value as any)}
                  className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none"
                >
                  <option value="all">Semua kolom</option>
                  <option value="vessel_name">Vessel</option>
                  <option value="voyage_number">Voyage Number</option>
                  <option value="voyage_year">Voyage Year</option>
                  <option value="port_name">Berth Location</option>
                  <option value="voyage_date_berth">Date Berth</option>
                  <option value="created_at">Created</option>
                  <option value="updated_at">Updated</option>
                  <option value="voyage_created_at">Voyage Created</option>
                  <option value="obstacles">Obstacles</option>
                </select>
              </div>

              {useAllPagesForSearch && searchText.trim() && (
                <span className="text-xs text-slate-500">
                  {loadingAll ? 'Mengambil semua halaman…' : (allLoaded ? `Data terambil: ${allData.length} baris` : 'Siap mengambil semua halaman')}
                </span>
              )}
            </div>

            <div className="flex w-full justify-start md:w-auto md:justify-start md:mt-0 mt-1">
              <button
                onClick={() => setShowCost((s) => !s)}
                className="text-sm rounded-md border border-slate-300 bg-white px-3 py-1 shadow hover:bg-slate-100"
                type="button"
              >
                {showCost ? 'Tampilkan Container Movement' : 'Tampilkan Cost Estimation'}
              </button>
            </div>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Tambah Voyage Baru"
          >
            <VoyageForm onSuccess={handleSuccess} />
          </Modal>
        </div>
      </div>

      <section className="bg-white backdrop-blur rounded-xl p-4 shadow mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium text-slate-800">
            {showCost ? 'Cost Estimation per Voyage' : 'Daftar Container Movement'}
          </h2>
          <div className="flex items-center gap-2">
            {!showCost && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  type="button"
                  className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-200"
                >
                  Tambah Data
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {!showCost && (
          <div
            className={`overflow-y-auto ${finalData.length > MAX_VISIBLE_ROWS ? 'shadow-inner' : ''} custom-scroll`}
            style={{ maxHeight: finalData.length > MAX_VISIBLE_ROWS ? maxBodyHeight : 'auto' }}
          >
            <table className="min-w-[1200px] w-full text-xs md:text-sm border-collapse">
              <CMHeader sortConfig={sortConfig} requestSort={requestSort} />
              <tbody>
                {finalData.map((row) => (
                  <CMRow key={row.id ?? row.voyage_id} row={row} onEdit={openEdit} />
                ))}
              </tbody>
            </table>
          </div>
          )}

          {showCost && (
            <div
              className={`overflow-y-auto ${finalData.length > MAX_VISIBLE_ROWS ? 'shadow-inner' : ''} custom-scroll`}
              style={{ maxHeight: finalData.length > MAX_VISIBLE_ROWS ? maxCostHeight : 'auto' }}
            >
              <table className="min-w-[1100px] w-full text-xs md:text-sm border-collapse">
                <CostHeader />
                <tbody>
                  {finalData.map((row) => {
                    const e = estimations[row.voyage_id];
                    const fmt = (val?: number | null) =>
                      val == null ? '-' : val.toLocaleString('id-ID');
                    return (
                      <tr key={`est-${row.id ?? row.voyage_id}`} className="hover:bg-gray-50 border-b last:border-b-0">
                        <td className="p-2 align-middle">{row.vessel_name} / {row.voyage_number}-{row.voyage_year}</td>
                        <td className="p-2 align-middle">{row.port_name}</td>
                        <td className="p-2 align-middle">{e?.estimation_cost1 == null ? '-' : `Rp${fmt(e?.estimation_cost1)}`}</td>
                        <td className="p-2 align-middle">{e?.estimation_cost2 == null ? '-' : `Rp${fmt(e?.estimation_cost2)}`}</td>
                        <td className="p-2 align-middle">{e?.final_cost == null ? '-' : `Rp${fmt(e?.final_cost)}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!showCost && totalPages > 0 && (
          <div className="flex items-center justify-between pt-3 border-t mt-4 text-sm">
            <span className="text-slate-600">
              Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong> ({totalRecords} data)
            </span>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2 mr-2">
                <span className="text-slate-600">Rows:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setPerPage(v);
                    setCurrentPage(1);
                  }}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 shadow-sm focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage <= 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>

              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage >= totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-1 shadow-sm hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </section>

      <EditContainerMovementModal
        isOpen={isEditOpen}
        onClose={closeEdit}
        row={editingRow}
        onUpdated={() => fetchData(currentPage)}
      />
    </>
  );
};

export default MonitoringVoyages;