module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/api/sensors/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
async function GET() {
    // For production, set BACKEND_URL to a public URL in environment variables
    const backendUrl = process.env.BACKEND_URL;
    // Only attempt real backend if BACKEND_URL is set to a public URL
    if (backendUrl && !backendUrl.includes("192.168") && !backendUrl.includes("localhost")) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(()=>controller.abort(), 8000);
            console.log("[v0] Fetching from:", `${backendUrl}/api/summary`);
            const response = await fetch(`${backendUrl}/api/summary`, {
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                const responseText = await response.text();
                if (responseText && responseText.trim().length > 0) {
                    try {
                        const data = JSON.parse(responseText);
                        if (data.latest && data.sensor_keys) {
                            console.log("[v0] Successfully received data from backend");
                            return Response.json({
                                mytime: data.mytime || new Date().toISOString(),
                                readings: data.latest,
                                sensor_keys: data.sensor_keys,
                                history: data.history || {},
                                prediction: data.prediction || {}
                            }, {
                                headers: {
                                    "Cache-Control": "no-store, max-age=0"
                                }
                            });
                        }
                    } catch (parseError) {
                        console.error("[v0] JSON Parse Error:", parseError);
                    }
                }
            }
        } catch (error) {
            console.error("[v0] Backend fetch error:", error instanceof Error ? error.message : String(error));
        }
    } else if (backendUrl) {
        console.log("[v0] Backend URL is private (localhost/192.168), using mock data for v0 preview");
    }
    // Default to mock data
    console.log("[v0] Using mock data");
    return Response.json(getMockData(), {
        status: 200
    });
}
function getMockData() {
    const now = new Date();
    const timestamp = now.toISOString();
    return {
        mytime: timestamp,
        readings: {
            Temperature: 26.5 + Math.random() * 3,
            Humidity: 65 + Math.random() * 10,
            "Cahaya (LDR)": 750 + Math.random() * 100,
            "Soil Moisture": 48 + Math.random() * 8
        },
        sensor_keys: [
            "Temperature",
            "Humidity",
            "Cahaya (LDR)",
            "Soil Moisture"
        ],
        history: generateMockHistory(),
        prediction: {
            Temperature: {
                trend: "Stabil",
                "10": 27.2,
                "30": 28.5
            },
            Humidity: {
                trend: "Naik",
                "10": 68.5,
                "30": 72.1
            },
            "Cahaya (LDR)": {
                trend: "Turun",
                "10": 680,
                "30": 620
            },
            "Soil Moisture": {
                trend: "Stabil",
                "10": 50.2,
                "30": 51.8
            }
        }
    };
}
function generateMockHistory() {
    const history = {};
    const now = new Date();
    for(let i = 30; i >= 0; i--){
        const time = new Date(now.getTime() - i * 2 * 60 * 1000);
        const timeStr = time.toISOString();
        history[timeStr] = {
            Temperature: 24 + Math.random() * 5,
            Humidity: 60 + Math.random() * 15,
            "Cahaya (LDR)": 700 + Math.random() * 150,
            "Soil Moisture": 45 + Math.random() * 12,
            timestamp: timeStr
        };
    }
    return history;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7ad01387._.js.map