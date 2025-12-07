// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { getTokenFromCookies, verifyAdminJWT } from "@/lib/auth";

const MIN_PASSWORD_LENGTH = 8;
const SALT_ROUNDS = 10;

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

// --- GET /api/admin/users ---
// 管理ユーザー一覧を返す
export async function GET(_req: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.admin.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admins }, { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// --- POST /api/admin/users ---
// 新規 Admin 作成
export async function POST(req: NextRequest) {
  try {
    // 認証必須（ログイン済み Admin だけが作成できる）
    const session = await requireAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. JSON を読む
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { username, email, password } = (body ?? {}) as {
      username?: unknown;
      email?: unknown;
      password?: unknown;
    };

    // 2. バリデーション
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "username, email and password are required." },
        { status: 400 }
      );
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
        },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. username / email の重複チェック
    const existing = await prisma.admin.findFirst({
      where: {
        OR: [{ username: normalizedUsername }, { email: normalizedEmail }],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (existing) {
      let msg = "Username or email already exists.";
      if (existing.username === normalizedUsername) {
        msg = "This username is already taken.";
      } else if (existing.email === normalizedEmail) {
        msg = "This email is already in use.";
      }

      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // 4. パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 5. Admin を作成（パスワードハッシュは返さない）
    const admin = await prisma.admin.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        admin,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
