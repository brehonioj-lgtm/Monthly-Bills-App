import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  ChevronDown,
  AlertTriangle,
  Wallet,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_KEY = 'monthly-bills-dashboard-app-v1';

const initialBills = [
  {
    id: 1,
    monthLabel: "Mar '26",
    title: 'Wifey Borrow for Overhauling',
    amount: 4000,
    dueDate: '2026-04-01',
    status: 'Unpaid',
  },
  {
    id: 2,
    monthLabel: "Mar '26",
    title: 'Paluwagan',
    amount: 2500,
    dueDate: '2026-04-01',
    status: 'Unpaid',
  },
  {
    id: 3,
    monthLabel: "Mar '26",
    title: 'Paylater',
    amount: 1296,
    dueDate: '2026-03-27',
    status: 'Unpaid',
  },
  {
    id: 4,
    monthLabel: "Mar '26",
    title: 'Lea and Marilyn Payment for Wifi',
    amount: 1000,
    dueDate: '2026-04-01',
    status: 'Unpaid',
  },
];

function peso(value) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatMonthLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  }).replace(' ', " '");
}

function formatDue(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function daysDiff(dateString) {
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

function classifyBill(bill) {
  if (bill.status === 'Paid') return 'paid';
  const diff = daysDiff(bill.dueDate);
  if (diff < 0) return 'overdue';
  if (diff <= 5) return 'dueSoon';
  return 'normal';
}

function StatusPill({ bill }) {
  const type = classifyBill(bill);

  if (bill.status === 'Paid') {
    return (
      <span className="inline-flex min-w-24 items-center justify-center rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
        Paid
      </span>
    );
  }

  if (type === 'dueSoon') {
    return (
      <span className="inline-flex min-w-24 items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-neutral-900">
        Unpaid
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-24 items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white">
      Unpaid
    </span>
  );
}

function LateNote({ bill }) {
  const diff = daysDiff(bill.dueDate);
  if (bill.status === 'Paid') return null;
  if (diff < 0) {
    return <div className="mt-1 text-right text-xs text-red-500">• {Math.abs(diff)} day late</div>;
  }
  if (diff <= 5) {
    return <div className="mt-1 text-right text-xs text-neutral-500">• in {diff} days</div>;
  }
  return null;
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-[28px] border border-neutral-300 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="px-4 py-6 text-sm text-neutral-500">{text}</div>;
}

function SectionHeader({ tint, icon, title, rightText, chevron = true }) {
  return (
    <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-neutral-200 px-4 py-4 ${tint}`}>
      <div>{icon}</div>
      <div className="text-[18px] font-bold tracking-tight text-neutral-900">{title}</div>
      <div className="flex items-center gap-2 text-base text-neutral-500">
        <span>{rightText}</span>
        {chevron ? <ChevronDown className="h-5 w-5" /> : null}
      </div>
    </div>
  );
}

function BillRow({ bill, onToggleStatus }) {
  return (
    <div className="grid grid-cols-[1.6fr_auto_auto] items-center border-t border-neutral-200 bg-white">
      <div className="p-4">
        <div className="text-[17px] font-medium leading-tight text-neutral-900">{bill.title}</div>
        <div className="mt-2 text-sm text-neutral-500">{bill.monthLabel}</div>
      </div>
      <div className="px-4 py-4 text-right">
        <div className="text-[18px] font-bold text-neutral-900">{peso(bill.amount)}</div>
        <div className="mt-2 text-sm text-neutral-500">{formatDue(bill.dueDate)}</div>
      </div>
      <div className="p-4 text-right">
        <StatusPill bill={bill} />
        <LateNote bill={bill} />
        {onToggleStatus ? (
          <button
            onClick={() => onToggleStatus(bill.id)}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Toggle Status
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function App() {
  const [bills, setBills] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialBills;
    } catch {
      return initialBills;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [showPaidSection, setShowPaidSection] = useState(false);
  const [showAllBills, setShowAllBills] = useState(true);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    dueDate: '',
    status: 'Unpaid',
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  }, [bills]);

  const sortedBills = useMemo(() => {
    return [...bills].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [bills]);

  const paidBills = sortedBills.filter((bill) => bill.status === 'Paid');
  const unpaidBills = sortedBills.filter((bill) => bill.status === 'Unpaid');
  const dueSoonBills = unpaidBills.filter((bill) => classifyBill(bill) === 'dueSoon');
  const overdueBills = unpaidBills.filter((bill) => classifyBill(bill) === 'overdue');

  const totals = useMemo(() => {
    const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paid = paidBills.reduce((sum, bill) => sum + bill.amount, 0);
    const dueSoon = dueSoonBills.reduce((sum, bill) => sum + bill.amount, 0);
    const overdue = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);
    return { total, paid, dueSoon, overdue };
  }, [bills, paidBills, dueSoonBills, overdueBills]);

  const progress = totals.total ? Math.round((totals.paid / totals.total) * 100) : 0;
  const remaining = totals.total - totals.paid;
  const nextDueSoon = dueSoonBills[0];

  function handleAddBill(e) {
    e.preventDefault();
    if (!form.title || !form.amount || !form.dueDate) return;

    const newBill = {
      id: Date.now(),
      title: form.title,
      amount: Number(form.amount),
      dueDate: form.dueDate,
      status: form.status,
      monthLabel: formatMonthLabel(new Date().toISOString().slice(0, 10)),
    };

    setBills((prev) => [...prev, newBill]);
    setForm({ title: '', amount: '', dueDate: '', status: 'Unpaid' });
    setShowForm(false);
  }

  function toggleStatus(id) {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id
          ? { ...bill, status: bill.status === 'Paid' ? 'Unpaid' : 'Paid' }
          : bill
      )
    );
  }

  function resetDemoData() {
    setBills(initialBills);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="min-h-screen bg-neutral-200 p-4 md:p-8">
      <div className="mx-auto max-w-md overflow-hidden rounded-[34px] bg-neutral-100 shadow-2xl ring-1 ring-black/5">
        <div className="bg-[#2554A4] px-6 py-7 text-center text-white">
          <h1 className="text-[34px] font-bold tracking-tight">Monthly Bills Dashboard</h1>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm((prev) => !prev)}
              className="flex w-full items-center justify-center gap-2 rounded-[24px] bg-[#2554A4] px-4 py-4 text-base font-bold text-white shadow-sm"
            >
              <Plus className="h-5 w-5" />
              Add New Bill
            </motion.button>
            <button
              onClick={resetDemoData}
              className="rounded-[24px] border border-neutral-300 bg-white px-4 py-4 text-sm font-bold text-neutral-700 shadow-sm"
            >
              Reset Demo Data
            </button>
          </div>

          {showForm ? (
            <Card className="p-4">
              <form className="space-y-3" onSubmit={handleAddBill}>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Bill description"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#2554A4]"
                />
                <input
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                  type="number"
                  placeholder="Amount"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#2554A4]"
                />
                <input
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  type="date"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#2554A4]"
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#2554A4]"
                >
                  <option>Unpaid</option>
                  <option>Paid</option>
                </select>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-neutral-900 px-4 py-3 font-bold text-white"
                >
                  Save Bill
                </button>
              </form>
            </Card>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Wallet className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-neutral-900">Total Bills</div>
                  <div className="text-3xl font-bold text-neutral-900">{peso(totals.total)}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-neutral-900">Paid</div>
                  <div className="text-3xl font-bold text-green-700">{peso(totals.paid)}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-white">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-neutral-900">Due Soon</div>
                  <div className="mt-1 text-base text-neutral-500">
                    {nextDueSoon ? formatDue(nextDueSoon.dueDate) : '-'}
                  </div>
                  <div className="mt-1 text-sm text-neutral-400">
                    {nextDueSoon ? `• in ${daysDiff(nextDueSoon.dueDate)} days` : ''}
                  </div>
                </div>
                <div className="text-right text-3xl font-bold text-neutral-900">{peso(totals.dueSoon)}</div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div>
                <div className="text-lg font-semibold text-neutral-900">Overdue</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-red-700">{peso(totals.overdue)}</div>
                <div className="mt-1 text-base text-red-500">
                  {overdueBills[0] ? `${Math.abs(daysDiff(overdueBills[0].dueDate))} day late` : ''}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-green-600" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-2xl text-neutral-500">{progress}%</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-[22px] bg-neutral-50 p-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Remaining</div>
                <div className="mt-1 text-xl font-bold text-neutral-900">{peso(remaining)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Bills Paid</div>
                <div className="mt-1 text-xl font-bold text-green-700">{paidBills.length}</div>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <button
              onClick={() => setShowPaidSection((prev) => !prev)}
              className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4 text-left"
            >
              <CircleDot className="h-7 w-7 text-amber-400" />
              <div className="text-[18px] font-bold text-neutral-900">Bills Paid</div>
              <ChevronDown className={`h-6 w-6 text-neutral-500 transition-transform ${showPaidSection ? 'rotate-180' : ''}`} />
            </button>
            {showPaidSection ? (
              paidBills.length ? (
                paidBills.map((bill) => <BillRow key={bill.id} bill={bill} onToggleStatus={toggleStatus} />)
              ) : (
                <EmptyState text="No paid bills yet." />
              )
            ) : null}
          </Card>

          <Card className="overflow-hidden">
            <SectionHeader
              tint="bg-amber-50"
              icon={<CircleDot className="h-5 w-5 text-amber-400" />}
              title={`DUE SOON (${dueSoonBills.length} Bills)`}
              rightText={dueSoonBills[0]?.monthLabel || ''}
            />
            {dueSoonBills.length ? (
              dueSoonBills.slice(0, 2).map((bill) => <BillRow key={bill.id} bill={bill} onToggleStatus={toggleStatus} />)
            ) : (
              <EmptyState text="No due soon bills." />
            )}
          </Card>

          <Card className="overflow-hidden">
            <SectionHeader
              tint="bg-red-50"
              icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
              title={`OVERDUE (${overdueBills.length} Bill${overdueBills.length === 1 ? '' : 's'})`}
              rightText={overdueBills[0]?.monthLabel || ''}
            />
            {overdueBills.length ? (
              overdueBills.slice(0, 1).map((bill) => <BillRow key={bill.id} bill={bill} onToggleStatus={toggleStatus} />)
            ) : (
              <EmptyState text="No overdue bills." />
            )}
          </Card>

          <Card className="overflow-hidden">
            <button onClick={() => setShowAllBills((prev) => !prev)} className="w-full text-left">
              <SectionHeader
                tint="bg-blue-50"
                icon={<CircleDot className="h-5 w-5 text-blue-600" />}
                title={`ALL BILLS (${unpaidBills.length} Unpaid)`}
                rightText=""
              />
            </button>
            {showAllBills ? (
              sortedBills.length ? (
                sortedBills.map((bill) => <BillRow key={bill.id} bill={bill} onToggleStatus={toggleStatus} />)
              ) : (
                <EmptyState text="No bills yet." />
              )
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
