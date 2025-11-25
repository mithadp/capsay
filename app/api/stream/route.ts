export async function GET() {
  const backendUrl = process.env.BACKEND_URL
  
  // Only attempt real backend if BACKEND_URL is set to a public URL
  if (backendUrl && !backendUrl.includes("192.168") && !backendUrl.includes("localhost")) {
    try {
      const response = await fetch(`${backendUrl}/api/stream`, {
        headers: {
          "Accept": "text/event-stream",
        },
      })

      if (response.ok) {
        return new Response(response.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
          },
        })
      }
    } catch (error) {
      console.error("[v0] Stream error:", error)
    }
  }

  // Default to mock SSE stream
  console.log("[v0] Using mock SSE stream")
  
  const mockStream = `data: ${JSON.stringify({
    latest: {
      Temperature: 26.5 + Math.random() * 3,
      Humidity: 65 + Math.random() * 10,
      "Cahaya (LDR)": 750 + Math.random() * 100,
      "Soil Moisture": 48 + Math.random() * 8,
    },
    sensor_keys: ["Temperature", "Humidity", "Cahaya (LDR)", "Soil Moisture"],
    mytime: new Date().toISOString(),
    history: {},
    prediction: {
      Temperature: { trend: "Stabil", "10": 27.2, "30": 28.5 },
      Humidity: { trend: "Naik", "10": 68.5, "30": 72.1 },
      "Cahaya (LDR)": { trend: "Turun", "10": 680, "30": 620 },
      "Soil Moisture": { trend: "Stabil", "10": 50.2, "30": 51.8 },
    },
  })}\n\n`

  return new Response(mockStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
