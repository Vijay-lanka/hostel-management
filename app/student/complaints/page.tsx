 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Complaint = {
  id: number;
  title: string;
  description: string;
  status: string;
};

export default function StudentComplaintsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    if (data) setComplaints(data);
    setLoading(false);
  };

  const submitComplaint = async () => {
    if (!title || !description) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("complaints").insert({
      student_id: user.id,
      title,
      description,
      status: "Open",
    });

    setTitle("");
    setDescription("");
    fetchComplaints();
  };

  useEffect(() => {
    const fetch = async () => {
      await fetchComplaints();
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Complaints</h1>

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <input
          type="text"
          placeholder="Complaint Title"
          className="w-full border p-3 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Complaint Description"
          className="w-full border p-3 rounded mb-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          onClick={submitComplaint}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
        >
          Submit Complaint
        </button>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold">{c.title}</h3>
            <p className="text-gray-600">{c.description}</p>
            <span className="text-sm text-indigo-600">Status: {c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
