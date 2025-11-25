"use client"
import { useState } from "react"
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from "@/components/sidebar-new"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const getActiveMenu = () => {
    if (pathname === "/overview") return "overview"
    if (pathname === "/trends") return "trends"
    if (pathname === "/analytics") return "analytics"
    if (pathname === "/settings") return "settings"
    return "overview"
  }

  const handleMenuChange = (menuId: string) => {
    router.push(`/${menuId}`)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-300 to-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-300 to-green-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-green-300 to-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <Sidebar activeMenu={getActiveMenu()} onMenuChange={handleMenuChange} />
      </div>
      
      <main className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 relative z-10 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
