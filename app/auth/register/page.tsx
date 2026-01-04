"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    room_number: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error || !data.user) {
      alert(error?.message || "Signup failed");
      setLoading(false);
      return;
    }

    // 2️⃣ Insert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        name: form.name,
        role: form.role,
        room_number: form.role === "student" ? form.room_number : null,
      });

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
      <motion.form
        onSubmit={handleRegister}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Create Account
        </h2>

        <input
          placeholder="Full Name"
          className="w-full mb-3 p-2 border rounded"
          required
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          required
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          required
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="w-full mb-3 p-2 border rounded"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        {/* Room number ONLY for students */}
        {form.role === "student" && (
          <input
            placeholder="Room Number"
            className="w-full mb-4 p-2 border rounded"
            required
            onChange={(e) =>
              setForm({ ...form, room_number: e.target.value })
            }
          />
        )}

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </motion.form>
    </div>
  );
}
