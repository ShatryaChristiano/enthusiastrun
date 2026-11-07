"use client";

import React, { useState } from "react";
import { Voucher } from "@/types/registration.md";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VoucherManagerProps {
  initialVouchers: Voucher[];
}

export default function VoucherManager({
  initialVouchers,
}: VoucherManagerProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "CATEGORY_5K"
  >("CATEGORY_5K");
  const [filterUsed, setFilterUsed] = useState<"all" | "used" | "unused">(
    "all"
  );
  const [filterCategory, setFilterCategory] = useState<
    "all" | "CATEGORY_5K"
  >("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create voucher
  const handleCreateVoucher = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/vouchers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selectedCategory }),
      });

      const data = await response.json();

      if (data.success) {
        setVouchers((prev) => [data.voucher, ...prev]);
        toast.success(
          `Voucher ${
            "5K"
          } berhasil dibuat!`
        );
      } else {
        toast.error(data.message || "Gagal membuat voucher");
      }
    } catch (error) {
      console.error("Create voucher error:", error);
      toast.error("Terjadi kesalahan saat membuat voucher");
    } finally {
      setIsCreating(false);
    }
  };

  // Delete voucher
  const handleDeleteVoucher = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setVouchers((prev) => prev.filter((v) => v.id !== id));
        toast.success("Voucher successfully deleted");
      } else {
        toast.error(data.message || "Failed to delete voucher");
      }
    } catch (error) {
      console.error("Delete voucher error:", error);
      toast.error("An error occurred while deleting the voucher");
    } finally {
      setDeletingId(null);
    }
  };

  // Copy voucher ID to clipboard
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success("Voucher code copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy voucher code");
    }
  };

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchesUsed =
      filterUsed === "all" ||
      (filterUsed === "used" && v.isUsed) ||
      (filterUsed === "unused" && !v.isUsed);

    const matchesCategory =
      filterCategory === "all" || v.category === filterCategory;

    return matchesUsed && matchesCategory;
  });

  // Stats
  const stats = {
    total: vouchers.length,
    used: vouchers.filter((v) => v.isUsed).length,
    unused: vouchers.filter((v) => !v.isUsed).length,
    category5k: vouchers.filter((v) => v.category === "CATEGORY_5K").length,
  };

  return (
    <div className="flex text-lg flex-col justify-center items-center w-full space-y-6">
      {/* Create Voucher Section */}
      <div className="w-full bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value as "CATEGORY_5K"
              )
            }
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#4BCFFC] focus:outline-none text-background"
          >
            <option value="CATEGORY_5K">5K Run</option>
          </select>
          <div className="flex items-end">
            <button
              onClick={handleCreateVoucher}
              disabled={isCreating}
              className={`px-6 py-3 rounded-lg font-heading text-white transition-all ${
                isCreating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#4BCFFC] hover:bg-[#3AA9D1]"
              }`}
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Loading...
                </span>
              ) : (
                "BUAT VOUCHER"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
        <div className="bg-white/20 border border-white/40 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-white">{stats.total}</p>
          <p className="text-white/70 text-sm">Total</p>
        </div>
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-green-300">{stats.unused}</p>
          <p className="text-green-300/70 text-sm">Available</p>
        </div>
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-red-300">{stats.used}</p>
          <p className="text-red-300/70 text-sm">Unavailable</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 text-center">
          <p className="text-3xl font-heading text-blue-300">
            {stats.category5k}
          </p>
          <p className="text-blue-300/70 text-sm">5K Run</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <select
          value={filterUsed}
          onChange={(e) =>
            setFilterUsed(e.target.value as "all" | "used" | "unused")
          }
          className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white focus:outline-none focus:border-[#4BCFFC]"
        >
          <option value="all" className="bg-background">
            Semua Status
          </option>
          <option value="unused" className="bg-background">
            Tersedia
          </option>
          <option value="used" className="bg-background">
            Terpakai
          </option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(
              e.target.value as "all" | "CATEGORY_5K"
            )
          }
          className="px-4 py-2 rounded-lg border-2 border-white/20 bg-white/10 text-white focus:outline-none focus:border-[#4BCFFC]"
        >
          <option value="all" className="bg-background">
            Semua Kategori
          </option>
          <option value="CATEGORY_5K" className="bg-background">
            5K Run
          </option>
        </select>
        <p className="text-white/70 text-sm self-center ml-auto">
          Menampilkan {filteredVouchers.length} dari {vouchers.length} voucher
        </p>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="text-background">No</TableHead>
                <TableHead className="text-background">Voucher Code</TableHead>
                <TableHead className="text-background">Category</TableHead>
                <TableHead className="text-background">Status</TableHead>
                <TableHead className="text-background">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No vouchers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVouchers.map((voucher, index) => (
                  <TableRow key={voucher.id} className="hover:bg-gray-50">
                    <TableCell className="text-background font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm text-background font-mono">
                          {voucher.id}
                        </code>
                        <button
                          onClick={() => handleCopyId(voucher.id)}
                          className={`p-1 rounded transition-colors ${
                            copiedId === voucher.id
                              ? "text-green-500"
                              : "text-gray-400 hover:text-[#4BCFFC]"
                          }`}
                          title="Copy code"
                        >
                          {copiedId === voucher.id ? (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          voucher.category === "CATEGORY_5K"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-purple-100 text-purple-800 border-purple-300"
                        }`}
                      >
                        {voucher.category === "CATEGORY_5K"
                          ? "5K Run"
                          : voucher.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          voucher.isUsed
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-green-100 text-green-800 border-green-300"
                        }`}
                      >
                        {voucher.isUsed ? "Unavailable" : "Available"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleDeleteVoucher(voucher.id)}
                        disabled={deletingId === voucher.id}
                        className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                          deletingId === voucher.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                      >
                        {deletingId === voucher.id ? "..." : "Delete"}
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
