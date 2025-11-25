"use client"
import { useEffect, useState, useCallback } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts"
import { Activity, Gauge, TrendingUp, AlertCircle } from 'lucide-react'

interface AppPyResponse {
  mytime: string
  readings: Record<string, number>
  sensor_keys: string[]
  history: Record<string, Record<string, any>>
  prediction: Record<string, { trend: string; "10": number | null; "30": number | null }>
  error?: string
}

const SENSOR_COLORS: Record<string, string> = {
  Temperature: "#ff6b35",
  Humidity: "#004e89",
  "Cahaya (LDR)": "#f7b801",
  "Soil Moisture": "#1b4332",
}

export default function AnalyticsPage() {
  const [currentData, setCurrentData] = useState<AppPyResponse | null>(null)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSensorData = useCallback(async () => {
    try {
      const response = await fetch("/api/sensors", {
        cache: "no-store",
      })

      if (!response.ok) throw new Error("Failed to fetch")
      const result: AppPyResponse = await response.json()

      setCurrentData(result)

      if (result.history && typeof result.history === "object") {
        const historyArray = Object.entries(result.history)
          .map(([, item]: [string, any]) => ({
            ...item,
            timestamp: new Date(item.timestamp || Date.now()).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }))
          .slice(-50)
        setHistoryData(historyArray)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSensorData()
    const interval = setInterval(fetchSensorData, 5000)
    return () => clearInterval(interval)
  }, [fetchSensorData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-semibold">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const sensors = currentData?.sensor_keys || []

  // Calculate statistics
  const statsData = sensors.map((sensor) => {
    const values = historyData.map((d) => d[sensor]).filter(Boolean) as number[]
    if (values.length === 0) return null

    return {
      name: sensor,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      optimal: values.filter((v) => {
        if (sensor === "Humidity" || sensor === "Soil Moisture") return v >= 30 && v <= 80
        if (sensor === "Temperature") return v >= 18 && v <= 30
        if (sensor === "Cahaya (LDR)") return v >= 100 && v <= 800
        return true
      }).length,
      warning: values.filter((v) => {
        if (sensor === "Humidity" || sensor === "Soil Moisture") return (v < 30 || v > 80)
        if (sensor === "Temperature") return (v < 18 || v > 30)
        if (sensor === "Cahaya (LDR)") return (v < 100 || v > 800)
        return false
      }).length,
    }
  }).filter(Boolean) as any[]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">Detailed insights and statistics</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
            <p className="text-slate-600 text-sm font-medium">{stat.name}</p>
            <div className="mt-3">
              <p className="text-sm text-slate-600">Avg: <span className="font-bold text-slate-900">{stat.avg.toFixed(1)}</span></p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs text-slate-600">Optimal: {stat.optimal}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-xs text-slate-600">Warning: {stat.warning}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart - Comparison */}
      {historyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Performance Metrics</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: "12px" }} />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="avg" fill="#1b4332" name="Average" />
              <Bar dataKey="optimal" fill="#16a34a" name="Optimal Count" />
              <Bar dataKey="warning" fill="#eab308" name="Warning Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie Charts - Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sensors.map((sensor, idx) => {
          const stat = statsData.find((s) => s.name === sensor)
          if (!stat) return null

          const total = stat.optimal + stat.warning
          const data = [
            { name: "Optimal", value: stat.optimal },
            { name: "Warning", value: stat.warning },
          ]

          return (
            <div key={sensor} className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">{sensor} Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#16a34a" />
                    <Cell fill="#eab308" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </div>
    </div>
  )
}
