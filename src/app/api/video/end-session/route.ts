import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json(
        { error: "session_id es requerido" },
        { status: 400 }
      );
    }

    const { data: session, error: fetchError } = await supabase
      .from("video_sessions")
      .select("*")
      .eq("id", session_id)
      .single();

    if (fetchError || !session) {
      return NextResponse.json(
        { error: "Sesion no encontrada" },
        { status: 404 }
      );
    }

    const endedAt = new Date().toISOString();
    const startedAt = session.started_at
      ? new Date(session.started_at)
      : new Date(session.created_at);
    const durationSeconds = Math.round(
      (new Date(endedAt).getTime() - startedAt.getTime()) / 1000
    );

    const { data: updated, error: updateError } = await supabase
      .from("video_sessions")
      .update({
        status: "completed",
        ended_at: endedAt,
        duration_seconds: durationSeconds,
      })
      .eq("id", session_id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("Error ending video session:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
