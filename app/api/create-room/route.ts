import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { citaId, properties } = await request.json()

    // Create a room using Daily.co API
    const response = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `consultation-${citaId}-${Date.now()}`,
        properties: {
          ...properties,
          exp: Math.floor(Date.now() / 1000) + 3600, // Room expires in 1 hour
        },
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create Daily.co room")
    }

    const room = await response.json()

    return NextResponse.json({
      roomUrl: room.url,
      roomName: room.name,
    })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json({ error: "Failed to create consultation room" }, { status: 500 })
  }
}
