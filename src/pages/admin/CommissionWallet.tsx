import React, { useState, FormEvent } from "react";
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  RefreshCw, 
  Check, 
  Copy, 
  Search, 
  BadgePercent, 
  BarChart3, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownToLine,
  Sliders, 
  AlertCircle,
  Clock,
  Sparkles,
  History,
  X,
  CheckCircle2,
  FileText
} from "lucide-react";
import { CommissionData } from "../adminTypes";
import { adminApi } from "../adminApi";

interface CommissionWalletProps {
  data: CommissionData | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onUpdateRate: (newRate: number) => Promise<void>;
  isUpdatingRate: boolean;
}

export const CommissionWallet: React.FC<CommissionWalletProps> = ({
  data,
  loading,
  onRefresh,
  onUpdateRate,
  isUpdatingRate,
}) => {
  const [rateInput, setRateInput] = useState<number>(data?.commissionRate ?? 5);
  const [isEditingRate, setIsEditingRate] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Withdrawal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>("");
  const [withdrawNote, setWithdrawNote] = useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Sync rate input when data loads
  React.useEffect(() => {
    if (data?.commissionRate !== undefined) {
      setRateInput(data.commissionRate);
    }
  }, [data?.commissionRate]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitRate = async (e: FormEvent) => {
    e.preventDefault();
    if (rateInput < 0 || rateInput > 100) return;
    await onUpdateRate(rateInput);
    setIsEditingRate(false);
  };

  const handlePresetSelect = (val: number) => {
    setRateInput(val);
  };

  const orders = data?.orders || [];
  const withdrawals = data?.withdrawals || [];

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCommission = data?.totalCommissionEarned ?? orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const totalWithdrawn = data?.totalWithdrawn ?? withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const runningBalance = data?.runningBalance ?? Math.max(0, totalCommission - totalWithdrawn);
  const avgCommission = orders.length > 0 ? Math.round(totalCommission / orders.length) : 0;
  const activeRate = data?.commissionRate ?? 5;

  const handleOpenWithdrawModal = () => {
    setWithdrawAmountInput(String(runningBalance));
    setWithdrawNote("");
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);
    setIsWithdrawModalOpen(true);
  };

  const handleSetWithdrawPreset = (percentage: number) => {
    const calculated = Math.max(0, Math.floor((runningBalance * percentage) / 100));
    setWithdrawAmountInput(String(calculated));
  };

  const handleSubmitWithdrawal = async (e: FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmountInput);

    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount greater than 0");
      return;
    }
    if (amountNum > runningBalance) {
      setWithdrawError(`Withdrawal amount (₹${amountNum.toLocaleString("en-IN")}) cannot exceed the current balance (₹${runningBalance.toLocaleString("en-IN")})`);
      return;
    }

    setIsSubmittingWithdraw(true);
    setWithdrawError(null);
    try {
      const res = await adminApi.withdrawPlatformFunds(amountNum, withdrawNote.trim());
      if (res?.success) {
        setWithdrawSuccessMsg(`₹${amountNum.toLocaleString("en-IN")} successfully deducted from Platform Wallet Balance.`);
        await onRefresh();
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawSuccessMsg(null);
        }, 1200);
      } else {
        setWithdrawError(res?.error || "Failed to process withdrawal");
      }
    } catch (err: any) {
      setWithdrawError(err?.message || "Failed to process withdrawal");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      ord.memberName.toLowerCase().includes(search.toLowerCase()) ||
      (ord.memberEmail && ord.memberEmail.toLowerCase().includes(search.toLowerCase())) ||
      (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 p-6 rounded-2xl border border-indigo-500/20 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
                Platform Earnings & Commission Wallet
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  REAL DATABASE
                </span>
              </h2>
              <p className="text-xs text-neutral-300 font-mono">
                Source: <code className="text-purple-300">alikendshop.orders</code> &amp; <code className="text-purple-300">alikendshop.platform_settings</code>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRefresh()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Super Admin Commission Setting Card */}
      <div className="bg-white dark:bg-[#141B2D] p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Global Platform Commission Rate
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure the percentage deducted internally from seller payouts upon successful order completion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 font-mono font-bold text-sm">
              <BadgePercent className="w-4 h-4 text-emerald-600" />
              <span>Current Rate: {activeRate}%</span>
            </div>
            {!isEditingRate && (
              <button
                onClick={() => setIsEditingRate(true)}
                className="text-xs font-semibold px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl transition-colors cursor-pointer"
              >
                Change Rate
              </button>
            )}
          </div>
        </div>

        {/* Rate Edit Form */}
        {isEditingRate ? (
          <form onSubmit={handleSubmitRate} className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Set New Rate (%):
              </label>
              <div className="relative w-32">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={rateInput}
                  onChange={(e) => setRateInput(parseFloat(e.target.value) || 0)}
                  className="w-full pl-3 pr-8 py-1.5 text-sm font-mono font-bold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-indigo-500 text-neutral-900 dark:text-white"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-neutral-400">%</span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
                {[3, 5, 7.5, 10, 12].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-2 py-1 text-[11px] font-mono font-semibold rounded-md border transition-all cursor-pointer ${
                      rateInput === preset
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:border-indigo-400"
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setRateInput(activeRate);
                    setIsEditingRate(false);
                  }}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRate}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isUpdatingRate ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Commission Rate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Updating this value persists globally in <code className="font-mono text-purple-600">alikendshop.platform_settings</code> and applies to all new orders.
            </p>
          </form>
        ) : null}

        {/* Customer Invoice Pricing Non-Additive Guarantee Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-blue-900 dark:text-blue-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-blue-950 dark:text-blue-100">
              Customer Pricing Transparency Policy (100% Non-Additive)
            </p>
            <p className="text-[11px] text-blue-800 dark:text-blue-300/90 leading-relaxed">
              Customer invoices and checkout totals reflect the exact price displayed on product catalog pages. 
              The platform commission ({activeRate}%) is automatically deducted internally from the seller&apos;s payout disbursement. It is never added on top of what the customer pays.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Commission Earned */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute right-3 -bottom-2 text-emerald-500/10 pointer-events-none">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold mb-1">
            Total Commission Earned
          </div>
          <div className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white">
            ₹{totalCommission.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-2 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            Accrued across {orders.length} real orders
          </div>
        </div>

        {/* Platform Running Balance (Wallet) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-3 -bottom-2 text-indigo-500/10 pointer-events-none">
            <Wallet className="w-24 h-24" />
          </div>
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-bold">
                Platform Wallet Balance
              </span>
              <button
                type="button"
                onClick={handleOpenWithdrawModal}
                disabled={runningBalance <= 0}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono tracking-wider bg-emerald-500 hover:bg-emerald-400 text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 cursor-pointer"
                title="Withdraw funds from platform wallet balance"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                Withdraw
              </button>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white">
              ₹{runningBalance.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-[11px] text-indigo-300/80 mt-3 flex items-center justify-between gap-2 font-medium flex-wrap">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Available to withdraw
            </span>
            {totalWithdrawn > 0 && (
              <span className="text-[10px] font-mono text-indigo-200 bg-indigo-500/25 px-2 py-0.5 rounded border border-indigo-400/30">
                ₹{totalWithdrawn.toLocaleString("en-IN")} withdrawn
              </span>
            )}
          </div>
        </div>

        {/* Gross Order Volume */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141B2D] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold mb-1">
            Customer Gross Paid Total
          </div>
          <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Exact customer billing volume
          </div>
        </div>

        {/* Average Commission Per Order */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141B2D] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-bold mb-1">
            Avg. Platform Margin / Order
          </div>
          <div className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">
            ₹{avgCommission.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            Average fee per checkout
          </div>
        </div>
      </div>

      {/* Orders Commission Ledger Table */}
      <div className="bg-white dark:bg-[#141B2D] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        {/* Table Filters & Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              Order Commission Transactions Ledger
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Each order calculates the configured platform fee ({activeRate}%) credited to the owner wallet, with remaining balance owed to seller.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, customers..."
                className="pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-900/60 text-neutral-500 dark:text-neutral-400 uppercase font-mono font-bold tracking-wider border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-4 py-3">Order Ref &amp; Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Customer Bill (Exact Total)</th>
                <th className="px-4 py-3 text-center">Commission %</th>
                <th className="px-4 py-3 text-right">Platform Fee (Earned)</th>
                <th className="px-4 py-3 text-right">Seller Payout</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3 text-center">Platform Credit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-neutral-400">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Clock className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600" />
                      <p className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
                        No commission orders match your filter
                      </p>
                      <p className="text-xs text-neutral-400">
                        When orders are placed through checkout, their calculated commission will automatically appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const dateStr = ord.date
                    ? new Date(ord.date).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recent";

                  return (
                    <tr key={ord._id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                      {/* Order Ref & Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-neutral-900 dark:text-white">
                          <span>{ord.orderNumber}</span>
                          <button
                            onClick={() => handleCopy(ord.orderNumber, ord._id)}
                            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            title="Copy Order #"
                          >
                            {copiedId === ord._id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5">{dateStr}</div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-neutral-900 dark:text-white">{ord.memberName}</div>
                        {ord.memberEmail && (
                          <div className="text-[11px] text-neutral-400 font-mono truncate max-w-[150px]">
                            {ord.memberEmail}
                          </div>
                        )}
                      </td>

                      {/* Customer Bill Total (Exact price) */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-neutral-900 dark:text-white">
                        ₹{(ord.total || 0).toLocaleString("en-IN")}
                        <div className="text-[10px] text-neutral-400 font-sans font-normal">Customer Paid</div>
                      </td>

                      {/* Commission % */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {ord.commissionRate}%
                        </span>
                      </td>

                      {/* Platform Fee Earned */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          +₹{(ord.commissionAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-emerald-700/80 dark:text-emerald-500/80 font-mono">
                          to Platform
                        </div>
                      </td>

                      {/* Seller Payout */}
                      <td className="px-4 py-3.5 text-right font-mono text-neutral-700 dark:text-neutral-300">
                        ₹{(ord.sellerPayout || 0).toLocaleString("en-IN")}
                        <div className="text-[10px] text-neutral-400 font-sans">Seller Net Share</div>
                      </td>

                      {/* Payment Method */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                          {ord.paymentMethod || "CARD"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-2.5 h-2.5" />
                          CREDITED
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="font-mono">
            Showing <strong className="text-neutral-900 dark:text-white">{filteredOrders.length}</strong> of{" "}
            <strong className="text-neutral-900 dark:text-white">{orders.length}</strong> total platform transactions
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div>
              Total Customer Spend: <strong className="text-neutral-900 dark:text-white">₹{totalRevenue.toLocaleString("en-IN")}</strong>
            </div>
            <div>
              Platform Commission: <strong className="text-emerald-600 dark:text-emerald-400">₹{totalCommission.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Withdrawal History Table */}
      <div className="bg-white dark:bg-[#141B2D] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Platform Withdrawal History
              </h3>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {withdrawals.length} {withdrawals.length === 1 ? "withdrawal" : "withdrawals"}
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Internal tracking ledger of balance withdrawals deducted from the platform wallet
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Total Disbursed</div>
              <div className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
                ₹{totalWithdrawn.toLocaleString("en-IN")}
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenWithdrawModal}
              disabled={runningBalance <= 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" />
              New Withdrawal
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <th className="px-4 py-3.5">Date & Timestamp</th>
                <th className="px-4 py-3.5 text-right">Withdrawn Amount</th>
                <th className="px-4 py-3.5">Internal Note / Purpose</th>
                <th className="px-4 py-3.5">Authorized By</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 dark:text-neutral-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-400 mb-3">
                        <History className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-neutral-700 dark:text-neutral-300 text-sm">
                        No Withdrawals Recorded Yet
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Use the <strong className="text-emerald-600 dark:text-emerald-400">Withdraw</strong> button on the Platform Wallet Balance card to record internal disbursements.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                withdrawals.map((w, idx) => (
                  <tr
                    key={w._id || idx}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{new Date(w.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        <span className="text-[10px] text-neutral-400">
                          {new Date(w.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap text-sm">
                      -₹{(Number(w.amount) || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5 text-neutral-800 dark:text-neutral-200">
                      {w.note ? (
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 text-neutral-400 shrink-0" />
                          <span>{w.note}</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Internal platform balance withdrawal</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-neutral-600 dark:text-neutral-400">
                      <div className="font-medium text-neutral-800 dark:text-neutral-200">{w.adminName || "Super Admin"}</div>
                      <div className="text-[10px] text-neutral-400">{w.adminEmail || "superadmin@alikend.com"}</div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <Check className="w-2.5 h-2.5" />
                        {w.status || "COMPLETED"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Wallet Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isSubmittingWithdraw && setIsWithdrawModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#141B2D] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden text-neutral-900 dark:text-white relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif">Withdraw Platform Funds</h3>
                  <p className="text-xs text-indigo-300 font-mono">
                    Internal tracking deduction from wallet balance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                disabled={isSubmittingWithdraw}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitWithdrawal} className="p-6 space-y-5">
              {/* Current Balance Summary Box */}
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">
                    Current Wallet Balance
                  </div>
                  <div className="text-2xl font-bold font-serif text-indigo-950 dark:text-indigo-200 mt-0.5">
                    ₹{runningBalance.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  <div>Lifetime Total Commission:</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{totalCommission.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] text-neutral-400">Permanent & unchanged</div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Amount to Withdraw (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-neutral-500 dark:text-neutral-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={runningBalance}
                    step="1"
                    required
                    value={withdrawAmountInput}
                    onChange={(e) => setWithdrawAmountInput(e.target.value)}
                    disabled={isSubmittingWithdraw}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-mono text-lg font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                    placeholder="Enter amount"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Quick set:</span>
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSetWithdrawPreset(pct)}
                      disabled={isSubmittingWithdraw || runningBalance <= 0}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {pct === 100 ? "Full (100%)" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remaining Balance Preview */}
              {withdrawAmountInput && !isNaN(Number(withdrawAmountInput)) && (
                <div className="text-xs font-mono flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Remaining Balance after withdrawal:</span>
                  <span className={`font-bold ${runningBalance - Number(withdrawAmountInput) < 0 ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"}`}>
                    ₹{Math.max(0, runningBalance - Number(withdrawAmountInput)).toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Optional Note Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Internal Note / Purpose (Optional)
                </label>
                <textarea
                  rows={2}
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  disabled={isSubmittingWithdraw}
                  placeholder="e.g., Weekly owner disbursement, operational transfer, etc."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50 resize-none"
                />
              </div>

              {/* Error Message */}
              {withdrawError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {/* Success Message */}
              {withdrawSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{withdrawSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  disabled={isSubmittingWithdraw}
                  className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || runningBalance <= 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-neutral-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isSubmittingWithdraw ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Recording Withdrawal...
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="w-4 h-4" />
                      Confirm & Deduct Balance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionWallet;
