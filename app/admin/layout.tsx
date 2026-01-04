 "use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, AlertCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const menu = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Home },
  { name: "Rooms", href: "/admin/rooms", icon: Users },
  { name: "Complaints", href: "/admin/complaints", icon: AlertCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-indigo-700 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-3">
            {menu.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    active ? "bg-white text-indigo-700" : "hover:bg-indigo-600"
                  }`}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 text-sm hover:text-red-300 transition"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
