"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Registration } from "@/types/registration.md";
import {
  updateRegistrationStatus,
  sendPendingRacepackEmails,
} from "@/lib/registration";
import { toast } from "sonner";
import RegistrationDetailModal from "./RegistrationDetailModal";

interface RegistrationTableProps {
  registrations: Registration[];
}

export default function RegistrationTable({
  registrations: initialRegistrations,
}: RegistrationTableProps) {
  const router = useRouter();
  const [registrations, setRegistrations] =
    useState<Registration[]>(initialRegistrations);
  // Sinkronkan dengan data server setiap router.refresh() (mis. QR/email
  // baru dibuat setelah konfirmasi) — state lokal hanya untuk update optimistik.
  const [prevInitial, setPrevInitial] = useState(initialRegistrations);
  if (initialRegistrations !== prevInitial) {
    setPrevInitial(initialRegistrations);
    setRegistrations(initialRegistrations);
  }
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "cancelled"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "CATEGORY_5K"
  >("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const handleExportToExcel = () => {
    const headers = [
      "No",
      "Name",
      "Email",
      "Phone Number",
      "Package",
      "Category",
      "Type",
      "Jersey Size",
      "Medical Condition",
      "Committee Inviter",
      "Status",
      "Payment",
      "Registration Date",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredRegistrations.map((reg, idx) => {
        return [
          idx + 1,
          `"${reg.fullName.replace(/"/g, '""')}"`,
          `"${reg.email}"`,
          `'${reg.phoneNumber}'`, // Using single quote so excel treats it as text
          `"${reg.chosenPackage?.replace("_", " ") || "personal"}"`,
          `"${reg.category === "CATEGORY_5K" ? "5K" : reg.category}"`,
          `"${reg.type.replace(/_/g, " ")}"`,
          `"${reg.jerseySize || "-"}"`,
          `"${reg.medicalCondition?.replace(/"/g, '""') || "-"}"`,
          `"${reg.committeeInviter?.replace(/"/g, '""') || "-"}"`,
          `"${reg.status}"`,
          `"${reg.paymentStatus ? "PAID" : "UNPAID"}"`,
          `"${new Date(reg.createdAt).toLocaleString()}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `registrations_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Exported successfully!");
  };

  const handleStatusUpdate = async (
    id: string,
    newStatus: "pending" | "confirmed" | "cancelled",
  ) => {
    setUpdatingId(id);
    const result = await updateRegistrationStatus(id, newStatus);

    if (result.success) {
      // Optimistic update — immediate visual feedback
      const updatedIds = new Set(result.updatedIds ?? [id]);
      setRegistrations((prev) =>
        prev.map((r) =>
          updatedIds.has(r.id)
            ? {
                ...r,
                status: newStatus,
                paymentStatus: newStatus === "confirmed",
              }
            : r,
        ),
      );
      toast.success(result.message || "Status updated");
      // Reconcile with DB truth so stats match the exported sheet
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update");
    }
    setUpdatingId(null);
  };

  const [sendingPending, setSendingPending] = useState(false);

  const handleSendPending = async () => {
    setSendingPending(true);
    const result = await sendPendingRacepackEmails();
    if (result.success) {
      toast.success(result.message || "Selesai");
      router.refresh();
    } else {
      toast.error(result.error || "Gagal mengirim email QR");
    }
    setSendingPending(false);
  };

  // Peserta confirmed yang belum punya QR / email QR belum terkirim
  const pendingQREmails = registrations.filter(
    (r) => r.status === "confirmed" && (!r.qrCode || r.emailStatus !== "SENT"),
  ).length;

  const openModal = (reg: Registration) => {
    setSelectedReg(reg);
    setIsModalOpen(true);
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchCategory =
      categoryFilter === "all" || r.category === categoryFilter;
    const matchSearch =
      searchQuery === "" ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneNumber.includes(searchQuery);
    return matchStatus && matchCategory && matchSearch;
  });

  // Satu baris per transaksi pendaftaran (groupId). Data lama tanpa groupId
  // dikelompokkan per userId + menit createdAt seperti sebelumnya.
  const groupedForDisplay = filteredRegistrations.reduce((acc, reg) => {
    const timeBucket = Math.floor(new Date(reg.createdAt).getTime() / 60000);
    const groupKey = reg.groupId ?? `${reg.userId}-${timeBucket}`;
    if (!acc.has(groupKey)) {
      acc.set(groupKey, reg); // Keep first registration as representative
    }
    return acc;
  }, new Map<string, Registration>());

  const displayRegistrations = Array.from(groupedForDisplay.values());

  const totalPages = Math.ceil(displayRegistrations.length / ITEMS_PER_PAGE);
  const paginatedRegistrations = displayRegistrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Stats based on ALL participants, not grouped
  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "pending").length,
    confirmed: registrations.filter((r) => r.status === "confirmed").length,
    cancelled: registrations.filter((r) => r.status === "cancelled").length,
  };

  return (
    <div className="w-[90%] md:w-full space-y-6 mt-4 md:mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/20 border border-white/40 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-white">{stats.total}</p>
          <p className="text-white/70 text-sm">Total</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-yellow-300">
            {stats.pending}
          </p>
          <p className="text-yellow-300/70 text-sm">Pending</p>
        </div>
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-green-300">
            {stats.confirmed}
          </p>
          <p className="text-green-300/70 text-sm">Confirmed</p>
        </div>
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-red-300">{stats.cancelled}</p>
          <p className="text-red-300/70 text-sm">Cancelled</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search by name, email, or phone..."
          className="flex-1 px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-[#4BCFFC]"
        />
        <select
          value={filter}
          onChange={(e) => {
            setFilter(
              e.target.value as "all" | "pending" | "confirmed" | "cancelled",
            );
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white focus:outline-none focus:border-[#4BCFFC]"
        >
          <option value="all" className="bg-background">
            All Status
          </option>
          <option value="pending" className="bg-background">
            Pending
          </option>
          <option value="confirmed" className="bg-background">
            Confirmed
          </option>
          <option value="cancelled" className="bg-background">
            Rejected
          </option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(
              e.target.value as "all" | "CATEGORY_5K",
            );
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white focus:outline-none focus:border-[#4BCFFC]"
        >
          <option value="all" className="bg-background">
            All Categories
          </option>
          <option value="CATEGORY_5K" className="bg-background">
            5K Run
          </option>
        </select>
        <button
          onClick={handleSendPending}
          disabled={sendingPending || pendingQREmails === 0}
          title="Buat QR individual & kirim ke email peserta confirmed yang belum menerima QR"
          className="px-4 py-2 bg-[#4BCFFC] hover:bg-[#3AA9D1] text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendingPending ? "Mengirim..." : `Kirim QR yang tertunda (${pendingQREmails})`}
        </button>
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
        >
          Export to Excel
        </button>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-white/70 text-sm">
          Showing{" "}
          {paginatedRegistrations.length > 0
            ? (currentPage - 1) * ITEMS_PER_PAGE + 1
            : 0}{" "}
          -{" "}
          {Math.min(currentPage * ITEMS_PER_PAGE, filteredRegistrations.length)}{" "}
          of {filteredRegistrations.length} registrations
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-white text-sm flex items-center">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-white/70 text-sm hover:text-white underline"
          >
            Clear search
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Package
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs  text-background uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No registrations found
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg, idx) => (
                  <tr
                    key={reg.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-background font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-background ">
                      {reg.fullName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px]  uppercase ${reg.chosenPackage === "bundling" ? "bg-orange-100 text-orange-700" : reg.chosenPackage === "ucstudent" ? "bg-blue-100 text-blue-700" : reg.chosenPackage?.startsWith("community") ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {reg.chosenPackage?.replace("_", " ") || "personal"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${reg.category === "CATEGORY_5K" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}
                      >
                        {reg.category === "CATEGORY_5K" ? "5K" : reg.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-background uppercase">
                      {reg.type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${reg.status === "confirmed" ? "bg-green-100 text-green-800" : reg.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${reg.paymentStatus ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {reg.paymentStatus ? "PAID" : "UNPAID"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(reg)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                        >
                          View
                        </button>
                        {reg.status !== "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(reg.id, "confirmed")
                            }
                            disabled={updatingId === reg.id}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition disabled:bg-gray-400"
                          >
                            {updatingId === reg.id ? "..." : "Confirm"}
                          </button>
                        )}
                        {reg.status !== "cancelled" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(reg.id, "cancelled")
                            }
                            disabled={updatingId === reg.id}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition disabled:bg-gray-400"
                          >
                            {updatingId === reg.id ? "..." : "Reject"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RegistrationDetailModal
        registration={selectedReg}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
