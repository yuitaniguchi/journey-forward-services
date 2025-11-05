import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { signAdminJWT, setSessionCookie } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json(
        { error: "username and password required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin?.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = await signAdminJWT({
      sub: admin.id,
      username: admin.username,
    });
    await setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
