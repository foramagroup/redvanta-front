// frontend/components/admin/AdminSidebar.jsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "NFC", href: "/dashboard/nfc" },
  { label: "Users", href: "/dashboard/users" },
  { label: "Products", href: "/dashboard/products" },
  { label: "Subscriptions", href: "/dashboard/subscriptions" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function AdminSidebar({ uidProp }) {
  const pathname = usePathname() || "/";
  // attempt to derive uid from path if not passed
  let uid = uidProp || null;
  if (!uid) {
    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("dashboard");
    if (idx >= 0 && parts.length > idx + 1) uid = parts[idx + 1];
  }

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-6 fixed">
      <h2 className="text-xl font-bold mb-6">Krootal Admin</h2>
      <nav className="flex flex-col gap-2">
        {menu.map((m) => {
          const target = uid ? `${m.href}/${uid}` : m.href;
          return (
            <Link key={m.href} href={target} className="px-3 py-2 rounded hover:bg-gray-800">
              {m.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
