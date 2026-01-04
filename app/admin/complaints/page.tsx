 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Complaint = {
  id: number;
  title: string;
  description: string;
  status: string;
  profiles: { name: string } | null;
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*, profiles(name)")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    if (data) setComplaints(data as Complaint[]);
    setLoading(false);
  };

  useEffect(() => {
    const fetch = async () => {
      await loadComplaints();
    };
    fetch();
  }, []);

  const updateStatus = async (id: number, newStatus: string) => {
    await supabase.from("complaints").update({ status: newStatus }).eq("id", id);
    loadComplaints();
  };

  const statusOptions = ["Open", "In Progress", "Resolved"];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Complaints</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Student</th>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.profiles?.name || "Student"}</td>
                <td className="p-3">{c.title}</td>
                <td className="p-3">{c.description}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      c.status === "Open"
                        ? "bg-red-100 text-red-600"
                        : c.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3">
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}
        {!loading && complaints.length === 0 && (
          <p className="p-4 text-center text-gray-500">No complaints found</p>
        )}
      </div>
    </div>
  );
}
