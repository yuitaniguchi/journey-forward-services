"use client";

import { useState } from "react";
import {
  createDiscountCode,
  updateDiscountCode,
  toggleDiscountStatus,
  deleteDiscountCode,
} from "@/app/actions/admin-discounts";
import type { DiscountCode } from "@prisma/client";
import {
  Calendar,
  ArrowRight,
  Trash2,
  Tag,
  Percent,
  DollarSign,
  Plus,
  Edit,
} from "lucide-react";

type Props = {
  initialDiscounts: DiscountCode[];
};

function formatDate(date: Date | string | null) {
  if (!date) return "Indefinite";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function dateToInput(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type DiscountFormState = {
  id?: number;
  code: string;
  description: string;
  type: "FIXED_AMOUNT" | "PERCENTAGE";
  value: string;
  startsAt: string;
  expiresAt: string;
};

export default function DiscountManager({ initialDiscounts }: Props) {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [isCreating, setIsCreating] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitialFormState = (
    discount: DiscountCode | null
  ): DiscountFormState => {
    if (!discount) {
      return {
        code: "",
        description: "",
        type: "FIXED_AMOUNT",
        value: "",
        startsAt: dateToInput(new Date()),
        expiresAt: "",
      };
    }
    return {
      id: discount.id,
      code: discount.code,
      description: discount.description || "",
      type: discount.type as "FIXED_AMOUNT" | "PERCENTAGE",
      value: String(Number(discount.value)),
      startsAt: dateToInput(discount.startsAt),
      expiresAt: dateToInput(discount.expiresAt),
    };
  };

  const [formData, setFormData] = useState<DiscountFormState>(
    getInitialFormState(null)
  );

  const handleEditClick = (discount: DiscountCode) => {
    setFormData(getInitialFormState(discount));
    setEditingDiscount(discount);
    setIsCreating(false);
  };

  const handleCreateClick = () => {
    setEditingDiscount(null);
    setFormData(getInitialFormState(null));
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setEditingDiscount(null);
    setFormData(getInitialFormState(null));
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (
      formData.startsAt &&
      formData.expiresAt &&
      formData.startsAt > formData.expiresAt
    ) {
      alert("End date must be after start date.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      code: formData.code,
      description: formData.description,
      type: formData.type,
      value: Number(formData.value),
      startsAt: formData.startsAt,
      expiresAt: formData.expiresAt || undefined,
    };

    let res;
    if (formData.id) {
      res = await updateDiscountCode(formData.id, payload);
    } else {
      res = await createDiscountCode(payload);
    }

    if (res.success) {
      handleCloseModal();
      window.location.reload();
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    await toggleDiscountStatus(id, !currentStatus);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this discount code? This action cannot be undone."
      )
    )
      return;
    await deleteDiscountCode(id);
    window.location.reload();
  };

  const isModalOpen = !!editingDiscount || isCreating;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Existing Codes</h2>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 bg-[#1a7c4c] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#15603a] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add New Code</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {discounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No discount codes found. Create one to get started.
        </div>
      ) : (
        <>
          {/* === Desktop View (Table) === */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-[20%]">Code</th>
                    <th className="px-6 py-4 font-semibold w-[10%]">Type</th>
                    <th className="px-6 py-4 font-semibold w-[10%]">Value</th>
                    <th className="px-4 py-4 font-semibold w-[25%]">
                      Valid Period
                    </th>
                    <th className="px-4 py-4 font-semibold text-center w-[15%]">
                      Status
                    </th>
                    <th className="px-6 py-4 font-semibold text-right w-[10%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map((discount) => (
                    <tr
                      key={discount.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-gray-900">
                            {discount.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {discount.type === "FIXED_AMOUNT" ? "Fixed" : "Percent"}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {discount.type === "FIXED_AMOUNT" ? "$" : ""}
                        {Number(discount.value).toLocaleString()}
                        {discount.type === "PERCENTAGE" ? "%" : ""}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 p-1 rounded-lg w-fit whitespace-nowrap">
                          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatDate(discount.startsAt)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span
                              className={
                                discount.expiresAt
                                  ? "font-medium"
                                  : "text-gray-500 italic"
                              }
                            >
                              {formatDate(discount.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() =>
                            handleToggle(discount.id, discount.isActive)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a7c4c] focus:ring-offset-2 ${
                            discount.isActive ? "bg-[#1a7c4c]" : "bg-gray-300"
                          }`}
                          title={
                            discount.isActive
                              ? "Deactivate code"
                              : "Activate code"
                          }
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              discount.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <div className="text-[10px] font-medium text-gray-500 mt-1">
                          {discount.isActive ? "Active" : "Inactive"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(discount)}
                            title="Edit discount"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            title="Delete discount"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* === Mobile/Tablet View (Cards) === */}
          <div className="lg:hidden space-y-4">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4 text-[#1a7c4c]" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {discount.code}
                      </h3>
                    </div>
                    {discount.description && (
                      <p className="text-sm text-gray-500 ml-6">
                        {discount.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() =>
                        handleToggle(discount.id, discount.isActive)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        discount.isActive ? "bg-[#1a7c4c]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          discount.isActive ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="text-xs text-gray-500 mt-1">
                      {discount.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">
                      Type
                    </span>
                    <div className="flex items-center gap-1 font-medium text-gray-700">
                      {discount.type === "FIXED_AMOUNT" ? (
                        <>
                          <DollarSign className="w-4 h-4" /> Fixed
                        </>
                      ) : (
                        <>
                          <Percent className="w-4 h-4" /> Percent
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="text-xs text-gray-500 block mb-1">
                      Value
                    </span>
                    <div className="font-bold text-gray-900 text-lg">
                      {discount.type === "FIXED_AMOUNT" ? "$" : ""}
                      {Number(discount.value).toLocaleString()}
                      {discount.type === "PERCENTAGE" ? "%" : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-100 p-2 rounded-lg mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="flex items-center gap-2 w-full justify-between">
                    <span>{formatDate(discount.startsAt)}</span>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span
                      className={
                        discount.expiresAt ? "" : "text-gray-400 italic"
                      }
                    >
                      {formatDate(discount.expiresAt)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(discount)}
                    className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors mr-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(discount.id)}
                    className="flex items-center gap-2 text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Create / Edit Modal (Upsert Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingDiscount ? "Edit Discount Code" : "Create Discount Code"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. SUMMER2025"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 uppercase focus:ring-2 focus:ring-[#1a7c4c] focus:border-transparent outline-none font-medium"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional description"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1a7c4c] focus:border-transparent outline-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1a7c4c] focus:border-transparent outline-none bg-white"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as any })
                    }
                  >
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                    <option value="PERCENTAGE">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step={formData.type === "PERCENTAGE" ? "1" : "0.01"}
                    placeholder={
                      formData.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 50.00"
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#1a7c4c] focus:border-transparent outline-none"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Starts At <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1a7c4c] focus:border-transparent outline-none"
                    value={formData.startsAt}
                    onChange={(e) =>
                      setFormData({ ...formData, startsAt: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Expires At
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1a7c4c] focus:border-transparent outline-none"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank for indefinite.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#1a7c4c] text-white rounded-lg font-medium hover:bg-[#15603a] disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingDiscount
                      ? "Save Changes"
                      : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
