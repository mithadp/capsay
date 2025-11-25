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
"[project]/app/api/stream/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
async function GET() {
    const backendUrl = process.env.BACKEND_URL;
    // Only attempt real backend if BACKEND_URL is set to a public URL
    if (backendUrl && !backendUrl.includes("192.168") && !backendUrl.includes("localhost")) {
        try {
            const response = await fetch(`${backendUrl}/api/stream`, {
                headers: {
                    "Accept": "text/event-stream"
                }
            });
            if (response.ok) {
                return new Response(response.body, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "X-Accel-Buffering": "no"
                    }
                });
            }
        } catch (error) {
            console.error("[v0] Stream error:", error);
        }
    }
    // Default to mock SSE stream
    console.log("[v0] Using mock SSE stream");
    const mockStream = `data: ${JSON.stringify({
        latest: {
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
        mytime: new Date().toISOString(),
        history: {},
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
    })}\n\n`;
    return new Response(mockStream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ff5cf60d._.js.map