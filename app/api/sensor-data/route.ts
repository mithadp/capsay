import { NextResponse } from "next/server"

// Mock data generator - replace with actual Firebase integration
function generateMockData() {
  const data = []
  const now = new Date()

  for (let i = 19; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3000)
    data.push({
      timestamp: time.toLocaleTimeString("id-ID"),
      temperature: 24 + Math.random() * 4,
      humidity: 60 + Math.random() * 15,
      light: 300 + Math.random() * 400,
      soilMoisture: 55 + Math.random() * 20,
    })
  }

  return data
}

export async function GET() {
  try {
    // TODO: Replace with actual Firebase integration
    // const db = getDatabase()
    // const data = await db.ref('readings').get()

    const mockData = generateMockData()

    return NextResponse.json({
      data: mockData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching sensor data:", error)
    return NextResponse.json({ error: "Failed to fetch sensor data" }, { status: 500 })
  }
}
