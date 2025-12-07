// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getTokenFromCookies, verifyAdminJWT } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;

function parseId(paramId: string) {
  const id = Number(paramId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

async function requireAdminSession() {
  const token = await getTokenFromCookies();
  if (!token) return null;

  try {
    const session = await verifyAdminJWT(token);
    return session;
  } catch {
    return null;
  }
}

// --- PUT /api/admin/users/[id] ---
// username / email / (optional) newPassword を更新
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👇 ここで await
    const { id } = await params;
    const adminId = parseId(id);
    if (adminId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, email, newPassword } = (body ?? {}) as {
      username?: unknown;
      email?: unknown;
      newPassword?: unknown;
    };

    const data: {
      username?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (typeof username === "string" && username.trim()) {
      data.username = username.trim();
    }

    if (typeof email === "string" && email.trim()) {
      data.email = email.trim().toLowerCase();
    }

    if (typeof newPassword === "string" && newPassword.trim()) {
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          {
            error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
          },
          { status: 400 }
        );
      }
      data.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    if (
      !data.username &&
      !data.email &&
      typeof data.passwordHash === "undefined"
    ) {
      return NextResponse.json(
        { error: "Nothing to update." },
        { status: 400 }
      );
    }

    // ターゲット Admin が存在するか確認
    const target = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!target) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // username / email の重複チェック（自分自身は除外）
    if (data.username || data.email) {
      const existing = await prisma.admin.findFirst({
        where: {
          AND: [
            { id: { not: adminId } },
            {
              OR: [
                data.username ? { username: data.username } : undefined,
                data.email ? { email: data.email } : undefined,
              ].filter(Boolean) as any,
            },
          ],
        },
        select: {
          id: true,
          username: true,
          email: true,
        },
      });

      if (existing) {
        let msg = "Username or email already exists.";
        if (data.username && existing.username === data.username) {
          msg = "This username is already taken.";
        } else if (data.email && existing.email === data.email) {
          msg = "This email is already in use.";
        }

        return NextResponse.json({ error: msg }, { status: 400 });
      }
    }

    const updated = await prisma.admin.update({
      where: { id: adminId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ admin: updated }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- DELETE /api/admin/users/[id] ---
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 👇 ここで params を await する
    const { id } = await params;
    const adminId = parseId(id);
    if (adminId === null) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const currentAdminId = Number(session.sub);
    if (currentAdminId === adminId) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    try {
      await prisma.admin.delete({
        where: { id: adminId },
      });
    } catch {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
