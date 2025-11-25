"use client"
import { useState } from "react"
import { Settings, Bell, Database, RotateCw, AlertCircle, CheckCircle2, Wifi, Server } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    backendUrl: "http://192.168.18.52:5000",
    apiKey: "",
    refreshRate: 3000,
    dataRetention: 1000,
    alertThreshold: 80,
    emailNotifications: true,
    webSocketEnabled: false,
    firebaseDatabaseUrl: "https://dhtbaru-fef85-default-rtdb.asia-southeast1.firebasedatabase.app",
    firebaseStatus: "Connected via backend proxy",
  })

  const [saved, setSaved] = useState(false)
  const [testConnection, setTestConnection] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSave = () => {
    setSaved(true)
    localStorage.setItem("capsai_settings", JSON.stringify(settings))
    setTimeout(() => setSaved(false), 3000)
  }

  const handleTestConnection = async () => {
    setTestConnection("loading")
    try {
      const response = await fetch(`${settings.backendUrl}/ping`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${settings.apiKey}`,
        },
      })
      if (response.ok) {
        setTestConnection("success")
        setTimeout(() => setTestConnection("idle"), 3000)
      } else {
        setTestConnection("error")
        setTimeout(() => setTestConnection("idle"), 3000)
      }
    } catch (error) {
      setTestConnection("error")
      setTimeout(() => setTestConnection("idle"), 3000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Configure system preferences and backend connection</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-300 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <p className="text-emerald-700 font-semibold">Settings saved successfully!</p>
        </div>
      )}

      {/* Backend Connection Settings */}
      <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Server className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Backend Connection</h2>
        </div>

        <div className="space-y-6">
          {/* Backend URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Backend URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.backendUrl}
                onChange={(e) => setSettings({ ...settings, backendUrl: e.target.value })}
                placeholder="http://192.168.18.52:5000"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleTestConnection}
                disabled={testConnection === "loading"}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  testConnection === "loading"
                    ? "bg-slate-300 text-slate-700"
                    : testConnection === "success"
                    ? "bg-emerald-500 text-white"
                    : testConnection === "error"
                    ? "bg-red-500 text-white"
                    : "bg-slate-600 hover:bg-slate-700 text-white"
                }`}
              >
                <Wifi className="w-4 h-4" />
                {testConnection === "loading" ? "Testing..." : testConnection === "success" ? "Connected" : testConnection === "error" ? "Failed" : "Test"}
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2">IP address dan port backend sensor Anda. Contoh: http://192.168.18.52:5000 atau https://api.domain.com</p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">API Key (Optional)</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="Masukkan API key jika backend memerlukan autentikasi"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-600 mt-1">Gunakan jika backend memerlukan autentikasi Bearer token</p>
          </div>

          {/* WebSocket Option */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.webSocketEnabled}
                onChange={(e) => setSettings({ ...settings, webSocketEnabled: e.target.checked })}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="font-semibold text-slate-900">Enable WebSocket Real-time Streaming</p>
                <p className="text-sm text-slate-600">Jika diaktifkan, gunakan WebSocket untuk real-time updates (lebih cepat dari SSE)</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Firebase Configuration Section */}
      <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Firebase Configuration</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Firebase Database URL</label>
            <input
              type="text"
              defaultValue={settings.firebaseDatabaseUrl}
              placeholder="https://your-project.firebasedatabase.app"
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
            />
            <p className="text-xs text-slate-600 mt-1">Current Firebase: dhtbaru-fef85 (Asia Southeast)</p>
          </div>

          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-medium text-sm text-slate-900">Firebase Status</p>
              <p className="text-xs text-slate-600">Connected via backend proxy</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-700">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">System Configuration</h2>
        </div>

        <div className="space-y-6">
          {/* Refresh Rate */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Data Refresh Rate (ms)</label>
            <input
              type="number"
              value={settings.refreshRate}
              onChange={(e) => setSettings({ ...settings, refreshRate: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-600 mt-1">Interval untuk fetch data dari backend (ms). Default: 3000ms</p>
          </div>

          {/* Data Retention */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Data Points to Keep</label>
            <input
              type="number"
              value={settings.dataRetention}
              onChange={(e) => setSettings({ ...settings, dataRetention: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-600 mt-1">Maximum historical data points untuk display di charts</p>
          </div>

          {/* Alert Threshold */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Alert Threshold (%)</label>
            <input
              type="number"
              value={settings.alertThreshold}
              onChange={(e) => setSettings({ ...settings, alertThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-600 mt-1">Trigger alert ketika sensor reading exceed threshold ini</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Bell className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div>
              <p className="font-semibold text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-600">Terima alerts via email ketika thresholds exceeded</p>
            </div>
          </label>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white/60 backdrop-blur rounded-xl shadow-md border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">Maintenance</h2>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <RotateCw className="w-5 h-5 text-slate-600" />
              <div className="text-left">
                <p className="font-semibold text-slate-900">Clear Cache</p>
                <p className="text-xs text-slate-600">Hapus temporary data dan cache</p>
              </div>
            </div>
            <span className="text-slate-600">→</span>
          </button>

          <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-600" />
              <div className="text-left">
                <p className="font-semibold text-slate-900">Export Data</p>
                <p className="text-xs text-slate-600">Download semua sensor records dalam format CSV</p>
              </div>
            </div>
            <span className="text-slate-600">→</span>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-300 rounded-lg">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Backend Integration</p>
          <p>Settings ini akan disimpan di localStorage browser. Untuk production, gunakan environment variables di Vercel. Backend URL dan API Key akan digunakan untuk connect ke sensor Anda dengan real-time streaming via SSE atau WebSocket.</p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-md"
      >
        Save Settings
      </button>
    </div>
  )
}
