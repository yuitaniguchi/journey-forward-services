import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { cookies } from "next/headers";

const ALG = "HS256";

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("ADMIN_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}
function cookieName() {
  return process.env.ADMIN_SESSION_NAME || "admin_session";
}
function maxAgeSec() {
  const v = Number(process.env.ADMIN_SESSION_MAXAGE ?? "604800");
  return Number.isFinite(v) ? v : 604800;
}

export type AdminSession = {
  sub: string; // adminId
  username: string;
  iat?: number;
  exp?: number;
};

export async function signAdminJWT(payload: Omit<AdminSession, "iat" | "exp">) {
  return await new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec()}s`)
    .sign(getSecret());
}

export async function verifyAdminJWT(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: [ALG],
  });
  return payload as AdminSession;
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(cookieName(), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec(),
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(cookieName());
}

export async function getTokenFromCookies() {
  return (await cookies()).get(cookieName())?.value ?? null;
}
