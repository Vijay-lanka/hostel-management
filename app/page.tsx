 "use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, CreditCard, AlertCircle, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">
            Hostel<span className="text-yellow-300">Hub</span>
          </h1>

          <div className="flex gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2 rounded-lg border border-white hover:bg-white/10 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Smart Hostel <br />
              <span className="text-yellow-300">Management System</span>
            </h2>

            <p className="text-white/80 text-lg mb-8">
              Manage students, rooms, complaints, and payments effortlessly
              from one powerful dashboard.
            </p>

            <div className="flex gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-yellow-400 text-black rounded-xl font-semibold hover:bg-yellow-300 transition"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 border border-white rounded-xl hover:bg-white/10 transition"
              >
                Admin / Student Login
              </Link>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            <FeatureCard
              icon={<Users />}
              title="Student Management"
              desc="Track students, rooms & profiles"
            />
            <FeatureCard
              icon={<Home />}
              title="Room Allocation"
              desc="Easy room assignment & tracking"
            />
            <FeatureCard
              icon={<AlertCircle />}
              title="Complaints"
              desc="Raise & resolve issues faster"
            />
            <FeatureCard
              icon={<CreditCard />}
              title="Payments"
              desc="Fees, dues & payment history"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="text-center py-6 text-white/60 border-t border-white/20">
        © {new Date().getFullYear()} HostelHub. All rights reserved.
      </footer>
    </div>
  );
}

/* ================= FEATURE CARD ================= */
function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition">
      <div className="mb-4 text-yellow-300">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-white/70 text-sm">{desc}</p>
    </div>
  );
}
