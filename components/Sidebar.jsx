"use client";
import Link from "next/link";

export default function Sidebar(){
  return (
    <aside className="w-64">
      <nav className="space-y-2">
        <Link href="/admin/affiliates"><a className="block p-2">Affiliates</a></Link>
        <Link href="/admin/payouts"><a className="block p-2">Payouts</a></Link>
        <Link href="/admin/products"><a className="block p-2">Products</a></Link>
		<Link href="/dashboard/my-designs" className="sidebar-item">Mes designs</Link>
      </nav>
    </aside>
  )
}
