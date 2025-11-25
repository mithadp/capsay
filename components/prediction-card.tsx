"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from 'lucide-react'

interface PredictionCardProps {
  sensorName: string
  sensorKey: string
  currentValue: number
  value5Min: number | null
  value15Min: number | null
  trend: string
  unit: string
  color: string
}

export function PredictionCard({
  sensorName,
  sensorKey,
  currentValue,
  value5Min,
  value15Min,
  trend,
  unit,
  color,
}: PredictionCardProps) {
  const trendData = [
    { label: "Now", value: currentValue },
    { label: "5 Min", value: value5Min || currentValue },
    { label: "15 Min", value: value15Min || currentValue },
  ]

  const trendStatusColor: Record<string, string> = {
    "Naik": "text-red-600",
    "Turun": "text-blue-600",
    "Stabil": "text-emerald-600",
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-emerald-200 p-5 shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">{sensorName}</h3>
          <p className="text-xs text-slate-600 mt-1">Trend prediction</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 ${trendStatusColor[trend]}`}>
          {trend === "Stabil" ? "Stabil" : trend}
        </span>
      </div>

      {/* Line Chart */}
      <div className="mb-4 bg-white rounded-lg p-3 border border-slate-200">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={trendData} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: "11px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#f8fafc",
                border: `1px solid ${color}`,
                borderRadius: "6px",
              }}
              formatter={(value) => value?.toFixed(2) || 0}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ fill: color, r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Values */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-600 font-medium">5 Menit</p>
          <p className="text-sm font-bold text-slate-900">{value5Min?.toFixed(1) || "--"} <span className="text-xs text-slate-600">{unit}</span></p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-center">
          <p className="text-xs text-slate-600 font-medium">15 Menit</p>
          <p className="text-sm font-bold text-slate-900">{value15Min?.toFixed(1) || "--"} <span className="text-xs text-slate-600">{unit}</span></p>
        </div>
      </div>
    </div>
  )
}

export default PredictionCard
