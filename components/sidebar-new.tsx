"use client"

import { BarChart3, TrendingUp, Gauge, Settings, ChevronRight, Droplets, Menu, X } from 'lucide-react'
import { useState } from "react"
import Link from "next/link"

interface SidebarProps {
  activeMenu?: string
}

export function Sidebar({ activeMenu = "overview" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      href: "/overview",
      icon: Gauge,
      description: "Real-time sensor data",
    },
    {
      id: "trends",
      label: "Trends",
      href: "/trends",
      icon: TrendingUp,
      description: "Historical analysis",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      description: "Detailed insights",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: Settings,
      description: "Configuration",
    },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 md:hidden bg-gradient-to-br from-emerald-600 to-emerald-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl border-r border-slate-700/50 transition-transform duration-300 ease-out z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 group">
          <div className="flex items-center gap-3 mb-2 transition-transform duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center font-bold text-slate-900 group-hover:scale-110 transition-transform duration-200">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white font-sans text-2xl">CAPSAI</h1>
              <p className="text-xs text-slate-400">{""}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">Navigation</p>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleLinkClick}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group block ${
                activeMenu === item.id
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg scale-105"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:rotate-12" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-slate-400 group-hover:text-slate-300 truncate">{item.description}</p>
              </div>
              {activeMenu === item.id && <ChevronRight className="w-4 h-4 flex-shrink-0 animate-pulse" />}
            </Link>
          ))}
        </nav>

        {/* Stats Section */}
        <div className="p-4 border-t border-slate-700/50 space-y-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 rounded-lg p-4 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors duration-200 cursor-pointer group">
            <p className="text-xs text-slate-400 mb-2 uppercase font-semibold tracking-wide">Active Sensors</p>
            <p className="text-3xl font-bold text-emerald-400 group-hover:scale-110 transition-transform duration-200 origin-left">4</p>
            <p className="text-xs text-slate-400 mt-2">All operational</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg p-3 border border-slate-600/50 hover:border-slate-500/70 transition-colors duration-200 group">
            <p className="text-xs text-slate-400 font-semibold">Status</p>
            <p className="text-sm font-bold text-emerald-400 mt-1 group-hover:text-emerald-300 transition-colors duration-200">Connected</p>
          </div>
        </div>
      </aside>
    </>
  )
}
