"use client"

import { useState } from "react"
import { Home, LayoutDashboard, Leaf, Settings, Plus } from "lucide-react"

export function Sidebar() {
  const [activePage, setActivePage] = useState("dashboard")

  const menuItems = [
    {
      icon: Home,
      label: "Home",
      id: "home",
      description: "Overview of all sensor zones",
    },
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      id: "dashboard",
      description: "Real-time sensor monitoring",
      active: true,
    },
    {
      icon: Leaf,
      label: "Crop Management",
      id: "crops",
      description: "Manage crops and predictions",
    },
    {
      icon: Settings,
      label: "Settings",
      id: "settings",
      description: "Configure system and alerts",
    },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-emerald-700 to-emerald-800 text-white min-h-screen p-6 flex flex-col fixed left-0 top-0 shadow-xl">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">CAPSAI</h1>
        <p className="text-xs text-emerald-200 mt-1">IoT Analytics Platform</p>
      </div>

      {/* User Profile Section */}
      <div className="bg-emerald-600 rounded-2xl p-4 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full flex items-center justify-center font-bold text-emerald-900">
            CM
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">CAPSAI Admin</p>
            <p className="text-xs text-emerald-200">System Monitor</p>
          </div>
        </div>
        <button className="w-full bg-white text-emerald-700 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors">
          Profile
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-4">Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all text-left group ${
              item.active || activePage === item.id
                ? "bg-white text-emerald-700 font-semibold"
                : "text-emerald-100 hover:bg-emerald-600"
            }`}
            title={item.description}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Add Sensor Zone Section */}
      <div className="bg-emerald-600 rounded-2xl p-4 text-center">
        <p className="text-sm text-emerald-200 mb-4">Manage multiple sensor zones</p>
        <button className="w-full bg-white text-emerald-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors">
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>
    </div>
  )
}
