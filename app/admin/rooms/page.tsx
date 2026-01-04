 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface Room {
  id: number;
  room_number: string;
  capacity: number;
}

interface Student {
  id: string;
  name: string;
  payment_status: string;
  amount_paid: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Record<number, Student[]>>({});
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const ROOM_FEE = 10000; // Default fee

  // Fetch all rooms
  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("created_at", { ascending: false });
    setRooms(data || []);
  };

  // Fetch students per room
  const fetchStudentsForRooms = async () => {
    const result: Record<number, Student[]> = {};
    for (const room of rooms) {
      const { data: allocations } = await supabase
        .from("room_allocations")
        .select("student_id")
        .eq("room_id", room.id);

      const studentData: Student[] = [];
      if (allocations?.length) {
        for (const alloc of allocations) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, id")
            .eq("id", alloc.student_id)
            .single();

          // Fetch or create payment
          const { data: paymentData } = await supabase
            .from("payments")
            .select("*")
            .eq("student_id", alloc.student_id)
            .single();

          if (!paymentData) {
            // Create initial payment if missing
            await supabase.from("payments").insert({
              student_id: alloc.student_id,
              amount: ROOM_FEE,
              status: "Pending",
            });
          }

          studentData.push({
            id: alloc.student_id,
            name: profile?.name || "Student",
            payment_status: paymentData?.status || "Pending",
            amount_paid: paymentData?.status === "Paid" ? paymentData.amount : 0,
          });
        }
      }
      result[room.id] = studentData;
    }
    setStudents(result);
  };

  // Toggle payment status
  const togglePaymentStatus = async (studentId: string) => {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (!data) {
      // Create payment if missing
      await supabase.from("payments").insert({
        student_id: studentId,
        amount: ROOM_FEE,
        status: "Paid",
      });
    } else {
      // Toggle Paid/Pending
      const newStatus = data.status === "Paid" ? "Pending" : "Paid";
      await supabase.from("payments").update({ status: newStatus }).eq("id", data.id);
    }

    fetchStudentsForRooms();
  };

  const addRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber || !capacity) return;

    const { error } = await supabase.from("rooms").insert({
      room_number: roomNumber,
      capacity: Number(capacity),
    });

    if (error) return alert(error.message);
    setRoomNumber("");
    setCapacity("");
    fetchRooms();
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length) fetchStudentsForRooms();
  }, [rooms]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Rooms Management</h1>

      {/* Add Room Form */}
      <motion.form
        onSubmit={addRoom}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow mb-8 max-w-md"
      >
        <h2 className="text-xl font-semibold mb-4">Add Room</h2>
        <input
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Add Room
        </button>
      </motion.form>

      {/* Rooms Table */}
      {rooms.map((room) => (
        <div key={room.id} className="mb-6 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-3">Room {room.room_number}</h2>
          <p className="mb-2">Capacity: {room.capacity}</p>

          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Amount Paid</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students[room.id]?.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">₹{s.amount_paid}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        s.payment_status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {s.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => togglePaymentStatus(s.id)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}

              {!students[room.id]?.length && (
                <tr>
                  <td colSpan={4} className="p-3 text-gray-500">
                    No students assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
