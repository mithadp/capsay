import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  unit: string
  icon: LucideIcon
  status: "high" | "good" | "base" | "low"
  percentage?: number
}

export function StatCard({ title, value, unit, icon: Icon, status, percentage }: StatCardProps) {
  const statusStyles = {
    high: "bg-red-50 border-red-200 text-red-700",
    good: "bg-green-50 border-green-200 text-green-700",
    base: "bg-yellow-50 border-yellow-200 text-yellow-700",
    low: "bg-blue-50 border-blue-200 text-blue-700",
  }

  const statusBgColor = {
    high: "bg-red-100",
    good: "bg-green-100",
    base: "bg-yellow-100",
    low: "bg-blue-100",
  }

  return (
    <div className="bg-white rounded-2xl border p-6 hover:shadow-lg transition-all hover:border-emerald-300 border-background">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-gray-500">{unit}</span>
          </div>
        </div>
        <div className="bg-emerald-100 p-3 rounded-xl">
          <Icon className="w-6 h-6 text-emerald-700" />
        </div>
      </div>

      {/* Status Badge and Percentage */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusStyles[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  )
}
