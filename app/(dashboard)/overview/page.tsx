"use client"
import { useEffect, useState, useCallback } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Thermometer, Droplets, Sun, Leaf, TrendingUp, Wifi, RefreshCw, AlertCircle, Zap, Activity, Brain } from 'lucide-react'
import PredictionCard from "@/components/prediction-card"

interface AppPyResponse {
  mytime: string
  readings: Record<string, number>
  sensor_keys: string[]
  history: Record<string, Record<string, any>>
  prediction: Record<string, { trend: string; "10": number | null; "30": number | null }>
  error?: string
}

interface SensorConfig {
  name: string
  unit: string
  icon: any
  min: number
  max: number
  color: string
  bgColor: string
}

const SENSOR_CONFIGS: Record<string, SensorConfig> = {
  Temperature: {
    name: "Temperature",
    unit: "°C",
    icon: Thermometer,
    min: 0,
    max: 50,
    color: "#ff6b35",
    bgColor: "from-orange-500/10 to-red-500/10",
  },
  Humidity: {
    name: "Humidity",
    unit: "%",
    icon: Droplets,
    min: 0,
    max: 100,
    color: "#004e89",
    bgColor: "from-blue-500/10 to-cyan-500/10",
  },
  "Cahaya (LDR)": {
    name: "Light",
    unit: "lux",
    icon: Sun,
    min: 0,
    max: 1000,
    color: "#f7b801",
    bgColor: "from-yellow-500/10 to-orange-500/10",
  },
  "Soil Moisture": {
    name: "Soil Moisture",
    unit: "%",
    icon: Leaf,
    min: 0,
    max: 100,
    color: "#1b4332",
    bgColor: "from-green-500/10 to-emerald-500/10",
  },
}

const getStatus = (value: number, config: SensorConfig): "optimal" | "warning" | "critical" => {
  if (config.unit === "%") {
    if (value > 80) return "critical"
    if (value < 30) return "warning"
    return "optimal"
  } else if (config.unit === "°C") {
    if (value > 30) return "critical"
    if (value < 18) return "warning"
    return "optimal"
  } else if (config.unit === "lux") {
    if (value > 800) return "critical"
    if (value < 100) return "warning"
    return "optimal"
  }
  return "optimal"
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    optimal: "Optimal",
    warning: "Warning",
    critical: "Critical",
  }
  return labels[status] || "Normal"
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    optimal: "bg-emerald-100 text-emerald-700 border-emerald-300",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
    critical: "bg-red-100 text-red-700 border-red-300",
  }
  return colors[status] || "bg-slate-100 text-slate-700 border-slate-300"
}

export default function OverviewPage() {
  const [currentData, setCurrentData] = useState<AppPyResponse | null>(null)
  const [historyData, setHistoryData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [refreshing, setRefreshing] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  const fetchSensorData = useCallback(async () => {
    try {
      setError("")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch("/api/sensors", {
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) throw new Error(`API Error: ${response.status}`)

      const result: AppPyResponse = await response.json()
      if (!result.readings || Object.keys(result.readings).length === 0) {
        throw new Error("No sensor data received")
      }

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
          .slice(-30)
        setHistoryData(historyArray)
      }

      setLastUpdate(new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }))
      setConnected(true)

      try {
        const analyticsRes = await fetch("/api/analytics", { cache: "no-store" })
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json()
          setAnalytics(analyticsData)
        }
      } catch (analyticsError) {
        console.error("[v0] Analytics fetch error:", analyticsError)
      }
    } catch (error) {
      console.error("[v0] Error fetching sensor data:", error instanceof Error ? error.message : "Unknown error")
      setConnected(false)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchSensorData()
    const interval = setInterval(fetchSensorData, 3000)
    return () => clearInterval(interval)
  }, [fetchSensorData])

  useEffect(() => {
    let eventSource: EventSource | null = null

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/stream")

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.error) return

            if (data.latest) {
              const result: AppPyResponse = {
                mytime: data.mytime || new Date().toISOString(),
                readings: data.latest,
                sensor_keys: data.sensor_keys || [],
                history: data.history || {},
                prediction: data.prediction || {},
              }

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
                  .slice(-30)
                setHistoryData(historyArray)
              }

              setLastUpdate(new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }))
              setConnected(true)
              setError("")
            }
          } catch (parseError) {
            console.error("[v0] SSE parse error:", parseError)
          }
        }

        eventSource.onerror = () => {
          if (eventSource) eventSource.close()
          setTimeout(connectSSE, 2000)
        }
      } catch (error) {
        console.error("[v0] SSE connection error:", error)
        fetchSensorData()
      }
    }

    connectSSE()
    return () => {
      if (eventSource) eventSource.close()
    }
  }, [fetchSensorData])

  const handleManualRefresh = () => {
    setRefreshing(true)
    fetchSensorData()
  }

  if (loading && !currentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-700 font-semibold">Loading sensor data...</p>
        </div>
      </div>
    )
  }

  const sensors = currentData?.sensor_keys || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-600 mt-1">{"CAPSAI Platform Supported by IoT and Artificial Intelligence"}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${
            connected ? "bg-emerald-50 border-emerald-400" : "bg-red-50 border-red-400"
          }`}>
            {connected ? (
              <>
                <Wifi className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">Connected</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-semibold text-red-700">Disconnected</span>
              </>
            )}
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg bg-emerald-100 border border-emerald-300 hover:bg-emerald-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-emerald-700 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="flex items-center justify-between text-sm text-slate-600 bg-white/60 backdrop-blur px-4 py-3 rounded-lg border border-slate-200">
        <span>Last update: <span className="font-bold text-slate-900">{lastUpdate || "Loading..."}</span></span>
        
        {error && (
          <div className="flex items-center gap-2 text-amber-700 font-medium">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl shadow-md border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-xs font-medium uppercase">Data Quality</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{analytics.dataQuality}%</p>
              </div>
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl shadow-md border border-emerald-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-700 text-xs font-medium uppercase">Avg Health</p>
                <p className="text-2xl font-bold text-emerald-600 mt-2">
                  {analytics.analytics ? Math.round(
                    Object.values(analytics.analytics).reduce((sum: number, s: any) => sum + s.healthScore, 0) /
                    Object.keys(analytics.analytics).length
                  ) : 0}%
                </p>
              </div>
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl shadow-md border border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-xs font-medium uppercase">Anomalies</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">
                  {analytics.analytics ? Object.values(analytics.analytics).filter((s: any) => s.isAnomaly).length : 0}
                </p>
              </div>
              <AlertCircle className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Sensor Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {sensors.map((sensorKey) => {
          const config = SENSOR_CONFIGS[sensorKey]
          if (!config) return null

          const value = currentData?.readings[sensorKey] || 0
          const status = getStatus(value, config)
          const Icon = config.icon
          const analyticsData = analytics?.analytics?.[sensorKey]

          return (
            <div
              key={sensorKey}
              className={`bg-gradient-to-br ${config.bgColor} border-2 border-slate-200 rounded-xl p-5 shadow-md hover:shadow-lg transition-all backdrop-blur ${
                analyticsData?.isAnomaly ? "ring-2 ring-red-500" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <Icon className="w-6 h-6" style={{ color: config.color }} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </span>
              </div>
              
              <p className="text-slate-600 text-sm font-medium mb-1">{config.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900">{value.toFixed(1)}</p>
                <p className="text-slate-600 font-semibold">{config.unit}</p>
              </div>

              {analyticsData && (
                <div className="mt-3 pt-3 border-t border-slate-200/50 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Z-Score:</span>
                    <span className={`font-semibold ${analyticsData.zScore > 2.5 ? "text-red-600" : "text-emerald-600"}`}>
                      {analyticsData.zScore.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Health:</span>
                    <span className={`font-semibold ${analyticsData.healthScore >= 80 ? "text-emerald-600" : analyticsData.healthScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                      {analyticsData.healthScore}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Prediction & Forecast Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sensor Predictions</h2>
              <p className="text-xs text-slate-600">(5 & 15 Minutes)</p>
            </div>
          </div>

          <div className="space-y-4">
            {sensors.map((sensorKey) => {
              const config = SENSOR_CONFIGS[sensorKey]
              const pred = currentData?.prediction?.[sensorKey]
              if (!config || !pred) return null

              const trendColors: Record<string, string> = {
                "Naik": "text-red-600",
                "Turun": "text-blue-600",
                "Stabil": "text-emerald-600",
              }

              return (
                <div key={sensorKey} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900 text-sm">{config.name}</p>
                    <span className={`text-xs font-bold ${trendColors[pred.trend] || "text-slate-600"}`}>
                      {pred.trend}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <p className="text-slate-600">5 Min</p>
                      <p className="font-bold text-slate-900">{pred["10"]?.toFixed(1) || "--"} {config.unit}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200">
                      <p className="text-slate-600">15 Min</p>
                      <p className="font-bold text-slate-900">{pred["30"]?.toFixed(1) || "--"} {config.unit}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sensor Trends Chart */}
      {historyData.length > 0 && (
        <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sensor Trends</h2>
              <p className="text-xs text-slate-600">Last 30 readings</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#64748b" style={{ fontSize: "12px" }} />
              <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                }}
                formatter={(value) => (typeof value === "number" ? value.toFixed(2) : value)}
              />
              {sensors.map((key) => {
                const cfg = SENSOR_CONFIGS[key]
                return cfg ? (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={cfg.color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ) : null
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Footer Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/60 backdrop-blur rounded-xl border border-slate-200 p-6">
        <div className="text-center">
          <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">Active Sensors</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">4</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">Data Points</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{historyData.length}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">Status</p>
          <p className="text-lg font-bold text-emerald-600 mt-2">{connected ? "Active" : "Offline"}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-600 text-sm font-medium uppercase tracking-wide">Last Update</p>
          <p className="text-sm font-bold text-slate-900 mt-2">{lastUpdate || "--"}</p>
        </div>
      </div>
    </div>
  )
}
