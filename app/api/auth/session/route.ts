import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase/config";
import { cookies } from "next/headers";
import { ADMIN_EMAILS } from "@/lib/constants";

// POST: El cliente envía su token, creamos una cookie de sesión
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    // 1. Verificar que el token es válido
    const decodedToken = await auth.verifyIdToken(idToken);

    // 2. Verificar que es admin
    if (!ADMIN_EMAILS.includes(decodedToken.email || "")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 3. Crear cookie de sesión que dura 5 días
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 días
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });

    // 4. Guardar cookie en el navegador
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true, // Solo el servidor puede leerla
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creando sesión:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE: Eliminar sesión (logout)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
