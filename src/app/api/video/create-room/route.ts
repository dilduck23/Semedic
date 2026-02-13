import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { appointment_id } = await request.json();

    if (!appointment_id) {
      return NextResponse.json(
        { error: "appointment_id es requerido" },
        { status: 400 }
      );
    }

    // Verify the appointment exists and user is a participant
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .select("id, patient_id, doctor_id, type, status")
      .eq("id", appointment_id)
      .single();

    if (apptError || !appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (appointment.type !== "virtual") {
      return NextResponse.json(
        { error: "Solo citas virtuales pueden tener videollamada" },
        { status: 400 }
      );
    }

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("appointment_id", appointment_id)
      .single();

    if (existingSession) {
      return NextResponse.json({ session: existingSession });
    }

    // Create Daily.co room
    const DAILY_API_KEY = process.env.DAILY_API_KEY;

    if (!DAILY_API_KEY) {
      // Fallback for development: create session without Daily.co
      const roomName = `semedic-${appointment_id.slice(0, 8)}`;
      const { data: session, error: sessionError } = await supabase
        .from("video_sessions")
        .insert({
          appointment_id,
          room_name: roomName,
          room_url: `https://${process.env.NEXT_PUBLIC_DAILY_DOMAIN || "semedic.daily.co"}/${roomName}`,
          status: "waiting",
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      return NextResponse.json({ session });
    }

    const roomName = `semedic-${appointment_id.slice(0, 8)}-${Date.now()}`;

    const dailyRes = await fetch("https://api.daily.co/v1/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          max_participants: 2,
          enable_screenshare: true,
          enable_chat: true,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        },
      }),
    });

    if (!dailyRes.ok) {
      const err = await dailyRes.text();
      console.error("Daily.co error:", err);
      return NextResponse.json(
        { error: "Error al crear sala de video" },
        { status: 500 }
      );
    }

    const dailyRoom = await dailyRes.json();

    // Generate meeting tokens
    const createToken = async (isOwner: boolean) => {
      const tokenRes = await fetch("https://api.daily.co/v1/meeting-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            is_owner: isOwner,
            exp: Math.floor(Date.now() / 1000) + 3600,
          },
        }),
      });

      if (!tokenRes.ok) return null;
      const tokenData = await tokenRes.json();
      return tokenData.token as string;
    };

    const [hostToken, participantToken] = await Promise.all([
      createToken(true),
      createToken(false),
    ]);

    // Save session
    const { data: session, error: sessionError } = await supabase
      .from("video_sessions")
      .insert({
        appointment_id,
        room_name: dailyRoom.name,
        room_url: dailyRoom.url,
        host_token: hostToken,
        participant_token: participantToken,
        status: "waiting",
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Error creating video room:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
