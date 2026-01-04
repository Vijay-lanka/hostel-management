 "use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Home, AlertCircle, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Stat {
  title: string;
  value: number | string;
  icon: any;
  color: string;
}

interface PaymentRow {
  id: number;
  amount: number;
  status: string;
  payment_date: string;
  profiles: {
    name: string;
    room_number: string;
  };
}

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Students
      const { data: students } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student");
      setTotalStudents(students?.length || 0);

      // Rooms
      const { data: rooms } = await supabase.from("rooms").select("*");
      setTotalRooms(rooms?.length || 0);

      // Complaints
      const { data: complaints } = await supabase
        .from("complaints")
        .select("*")
        .eq("status", "Open");
      setOpenComplaints(complaints?.length || 0);

      // Payments with student details
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(
          `
          id,
          amount,
          status,
          payment_date,
          profiles (
            name,
            room_number
          )
        `
        )
        .order("payment_date", { ascending: false });

      const collected =
        paymentsData
          ?.filter((p) => p.status === "Paid")
          .reduce((acc, p) => acc + p.amount, 0) || 0;

      const pending =
        paymentsData
          ?.filter((p) => p.status !== "Paid")
          .reduce((acc, p) => acc + p.amount, 0) || 0;

      setTotalCollected(collected);
      setTotalPending(pending);
      setPayments(paymentsData || []);
    };

    fetchStats();
  }, []);

  const stats: Stat[] = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "bg-blue-500" },
    { title: "Total Rooms", value: totalRooms, icon: Home, color: "bg-green-500" },
    { title: "Open Complaints", value: openComplaints, icon: AlertCircle, color: "bg-red-500" },
    { title: "Total Collected", value: `₹${totalCollected}`, icon: CreditCard, color: "bg-indigo-500" },
    { title: "Pending Payments", value: `₹${totalPending}`, icon: CreditCard, color: "bg-yellow-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl text-white ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-gray-500">{stat.title}</p>
                  <h2 className="text-2xl font-bold">{stat.value}</h2>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Payment History</h2>

        {payments.length === 0 ? (
          <p className="text-gray-500">No payments yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.profiles?.name}</td>
                  <td className="p-3">{p.profiles?.room_number || "-"}</td>
                  <td className="p-3">₹{p.amount}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        p.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {new Date(p.payment_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
