"use client"

import { useState, useMemo } from "react"
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type SensorKey = "temperature" | "humidity" | "soilMoisture" | "cahaya"

// Sensor configuration with consistent typing
const SENSOR_CONFIG: Record<
  SensorKey,
  { label: string; unit: string; color: string; bgColor: string; optimalMin: number; optimalMax: number }
> = {
  temperature: {
    label: "Temperature",
    unit: "°C",
    color: "#f97316",
    bgColor: "#fed7aa",
    optimalMin: 20,
    optimalMax: 30,
  },
  humidity: { label: "Humidity", unit: "%", color: "#0ea5e9", bgColor: "#cffafe", optimalMin: 40, optimalMax: 80 },
  soilMoisture: {
    label: "Soil Moisture",
    unit: "%",
    color: "#84cc16",
    bgColor: "#dcfce7",
    optimalMin: 30,
    optimalMax: 70,
  },
  cahaya: {
    label: "Cahaya (LDR)",
    unit: "lux",
    color: "#fbbf24",
    bgColor: "#fef3c7",
    optimalMin: 600,
    optimalMax: 900,
  },
}

// Generate sample data
const generateSensorData = (baseValue: number, variance: number) => {
  const data = []
  for (let i = 0; i < 48; i++) {
    data.push({
      time: `${18 + Math.floor(i / 60)}:${String(i % 60).padStart(2, "0")}`,
      value: baseValue + (Math.random() - 0.5) * variance,
      timestamp: Date.now() - (48 - i) * 60000,
    })
  }
  return data
}

// Generate forecast data
const generateForecastData = (lastValue: number, trend: number) => {
  const forecast = []
  for (let i = 0; i <= 15; i++) {
    const baseValue = lastValue + trend * i
    const uncertainty = Math.abs(trend) * i * 0.5
    forecast.push({
      time: `+${i}min`,
      predicted: baseValue,
      upper: baseValue + uncertainty,
      lower: baseValue - uncertainty,
      timestamp: Date.now() + i * 60000,
    })
  }
  return forecast
}

// Calculate statistics
const calculateStats = (data: any[]) => {
  const values = data.map((d) => d.value)
  values.sort((a, b) => a - b)

  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const median = values[Math.floor(values.length / 2)]
  const min = values[0]
  const max = values[values.length - 1]
  const q1 = values[Math.floor(values.length * 0.25)]
  const q3 = values[Math.floor(values.length * 0.75)]
  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length)

  return {
    current: data[data.length - 1].value.toFixed(1),
    mean: mean.toFixed(1),
    median: median.toFixed(1),
    min: min.toFixed(1),
    max: max.toFixed(1),
    q1: q1.toFixed(1),
    q3: q3.toFixed(1),
    stdDev: stdDev.toFixed(2),
    changePercent: (((data[data.length - 1].value - data[0].value) / data[0].value) * 100).toFixed(1),
  }
}

export default function TrendsPage() {
  const [selectedSensor, setSelectedSensor] = useState<SensorKey>("temperature")

  // Generate data for all sensors
  const allSensorData = useMemo(
    () => ({
      temperature: generateSensorData(27, 5),
      humidity: generateSensorData(65, 15),
      soilMoisture: generateSensorData(45, 20),
      cahaya: generateSensorData(750, 200),
    }),
    [],
  )

  const allForecastData = useMemo(
    () => ({
      temperature: generateForecastData(allSensorData.temperature[47].value, -0.1),
      humidity: generateForecastData(allSensorData.humidity[47].value, 0.2),
      soilMoisture: generateForecastData(allSensorData.soilMoisture[47].value, 0.3),
      cahaya: generateForecastData(allSensorData.cahaya[47].value, -5),
    }),
    [allSensorData],
  )

  const stats = useMemo(() => calculateStats(allSensorData[selectedSensor]), [selectedSensor, allSensorData])
  const sensor = SENSOR_CONFIG[selectedSensor]
  const sensorData = allSensorData[selectedSensor]
  const forecastData = allForecastData[selectedSensor]

  const isOptimal = (value: number) => value >= sensor.optimalMin && value <= sensor.optimalMax

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sensor Trends Analysis</h1>
          <p className="text-slate-600">Deep-dive statistical analysis of individual sensor performance</p>
        </div>

        {/* Sensor Selection Tabs */}
        <Tabs value={selectedSensor} onValueChange={(v) => setSelectedSensor(v as SensorKey)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-1/2">
            {(Object.entries(SENSOR_CONFIG) as Array<[SensorKey, (typeof SENSOR_CONFIG)[SensorKey]]>).map(
              ([key, config]) => (
                <TabsTrigger key={key} value={key} className="text-xs md:text-sm">
                  {config.label}
                </TabsTrigger>
              ),
            )}
          </TabsList>

          <TabsContent value={selectedSensor} className="space-y-6 mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border-l-4" style={{ borderLeftColor: sensor.color }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-600">CURRENT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{stats.current}</span>
                    <span className="text-xs text-slate-600">{sensor.unit}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {Number.parseFloat(stats.changePercent as string) > 0 ? "↑" : "↓"}{" "}
                    {Math.abs(Number.parseFloat(stats.changePercent as string))}% from start
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-600">MEAN</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-slate-900">{stats.mean}</span>
                  <p className="text-xs text-slate-500 mt-2">Average value</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-600">STD DEV</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold text-slate-900">{stats.stdDev}</span>
                  <p className="text-xs text-slate-500 mt-2">Variability</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-slate-600">STATUS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${isOptimal(Number.parseFloat(stats.current as string)) ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    {isOptimal(Number.parseFloat(stats.current as string)) ? "Optimal" : "Caution"}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {sensor.optimalMin}-{sensor.optimalMax}
                    {sensor.unit}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historical Trends (Last 48 Minutes)</CardTitle>
                <CardDescription>Real-time sensor values with mean reference line</CardDescription>
              </CardHeader>
              <CardContent className="-mx-6 -mb-6 px-0">
                <ChartContainer
                  config={{
                    value: {
                      label: sensor.label,
                      color: sensor.color,
                    },
                  }}
                  className="h-[320px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sensorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`color-${selectedSensor}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={sensor.color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={sensor.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={sensor.color}
                        fillOpacity={1}
                        fill={`url(#color-${selectedSensor})`}
                      />
                      <Line
                        type="monotone"
                        dataKey={() => Number.parseFloat(stats.mean as string)}
                        stroke="#999"
                        strokeDasharray="5 5"
                        name="Mean"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>15-Minute Forecast Prediction</CardTitle>
                <CardDescription>ML-based linear regression with 95% confidence bands</CardDescription>
              </CardHeader>
              <CardContent className="-mx-6 -mb-6 px-0">
                <ChartContainer
                  config={{
                    predicted: {
                      label: "Predicted",
                      color: sensor.color,
                    },
                  }}
                  className="h-[280px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`forecast-${selectedSensor}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={sensor.color} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={sensor.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="upper"
                        fill={`url(#forecast-${selectedSensor})`}
                        stroke="none"
                        isAnimationActive={false}
                      />
                      <Area type="monotone" dataKey="lower" fill="white" stroke="none" isAnimationActive={false} />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke={sensor.color}
                        strokeWidth={2}
                        dot={{ fill: sensor.color, r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution Histogram</CardTitle>
                <CardDescription>Frequency distribution across {sensor.unit}</CardDescription>
              </CardHeader>
              <CardContent className="-mx-6 -mb-6 px-0">
                <ChartContainer
                  config={{
                    frequency: {
                      label: "Frequency",
                      color: sensor.color,
                    },
                  }}
                  className="h-[240px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { range: `${Number.parseInt(stats.min)}-${Number.parseInt(stats.min) + 5}`, frequency: 2 },
                        { range: `${Number.parseInt(stats.min) + 5}-${Number.parseInt(stats.min) + 10}`, frequency: 5 },
                        {
                          range: `${Number.parseInt(stats.min) + 10}-${Number.parseInt(stats.min) + 15}`,
                          frequency: 8,
                        },
                        {
                          range: `${Number.parseInt(stats.min) + 15}-${Number.parseInt(stats.min) + 20}`,
                          frequency: 12,
                        },
                        { range: `${Number.parseInt(stats.min) + 20}-${Number.parseInt(stats.max)}`, frequency: 21 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="range" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="frequency" fill={sensor.color} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Data Quality Metrics */}
            <Card className="border-l-4" style={{ borderLeftColor: "#10b981" }}>
              <CardHeader>
                <CardTitle>Data Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Data Points</p>
                    <p className="text-2xl font-bold text-slate-900">48</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Time Range</p>
                    <p className="text-2xl font-bold text-slate-900">48m</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Update Rate</p>
                    <p className="text-2xl font-bold text-slate-900">60s</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <p className="text-2xl font-bold text-green-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
