import type { LucideIcon } from "lucide-react"

interface StatCardNewProps {
  title: string
  value: string | number
  unit: string
  icon: LucideIcon
  status: "high" | "good" | "base" | "low"
  color?: string
}

export function StatCardNew({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status,
  color = "emerald"
}: StatCardNewProps) {
  const statusStyles = {
    high: "text-red-600 bg-red-50 border-red-200",
    good: "text-emerald-600 bg-emerald-50 border-emerald-200",
    base: "text-yellow-600 bg-yellow-50 border-yellow-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
  }

  const iconBgColor = {
    high: "bg-red-100",
    good: "bg-emerald-100",
    base: "bg-yellow-100",
    low: "bg-blue-100",
  }

  const iconColor = {
    high: "text-red-600",
    good: "text-emerald-600",
    base: "text-yellow-600",
    low: "text-blue-600",
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-slate-900">{value}</span>
            <span className="text-sm text-slate-500">{unit}</span>
          </div>
        </div>
        <div className={`${iconBgColor[status]} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor[status]}`} />
        </div>
      </div>
      
      {/* Status Badge */}
      <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    </div>
  )
}
