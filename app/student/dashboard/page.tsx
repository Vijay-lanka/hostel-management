 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Payment = {
  id: number;
  amount: number;
  payment_date: string;
  status: string;
  student_id: string;
};

export default function StudentDashboardPage() {
  const [totalFees, setTotalFees] = useState(10000); // Allocated fee
  const [paidAmount, setPaidAmount] = useState(0);
  const [balance, setBalance] = useState(10000);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", user.id)
        .order("payment_date", { ascending: false });

      const totalPaid = paymentsData?.reduce((acc, p) => acc + p.amount, 0) || 0;

      setPaidAmount(totalPaid);
      setBalance(totalFees - totalPaid);
      setPayments(paymentsData || []);
      setLoading(false);
    };

    fetchPayments();
  }, [totalFees]);

   const handlePayNow = async () => {
  if (balance <= 0) return;

  setPaying(true);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("User not authenticated");
    setPaying(false);
    return;
  }

  const { error: insertError } = await supabase
    .from("payments")
    .insert({
      student_id: user.id,
      amount: balance,
      status: "Paid",
    });

  if (insertError) {
    console.error("PAYMENT INSERT ERROR:", insertError);
    alert(insertError.message);
    setPaying(false);
    return;
  }

  // UI update after SUCCESS
  setPaidAmount(10000);
  setBalance(0);

  const { data: newPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("student_id", user.id)
    .order("payment_date", { ascending: false });

  setPayments(newPayments || []);
  setPaying(false);
};


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <>
          {/* Fees Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold">Total Fees</h2>
              <p className="text-4xl font-bold text-indigo-600 mt-2">
                ₹{balance} {/* Show remaining balance as fees */}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-lg font-semibold">Paid</h2>
              <p className="text-4xl font-bold text-green-600 mt-2">
                ₹{paidAmount}
              </p>
            </div>

            <div className="flex flex-col justify-between bg-white rounded-xl shadow p-6">
              <div>
                <h2 className="text-lg font-semibold">Balance</h2>
                <p className="text-4xl font-bold text-red-500 mt-2">
                  ₹{balance}
                </p>
              </div>
              <button
                onClick={handlePayNow}
                disabled={balance <= 0 || paying}
                className={`mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition ${
                  balance <= 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {paying ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-gray-500">No payments yet.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3">Date</th>
                    <th className="p-3">Amount (₹)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                      <td className="p-3">{p.amount}</td>
                      <td className="p-3">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
