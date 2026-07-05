import { NextRequest, NextResponse } from "next/server";


const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

async function proxy(req: NextRequest, path: string[]) {
  const url = `${BACKEND_URL}/api/${path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, {
    method: req.method,
    headers: { "Content-Type": req.headers.get("Content-Type") ?? "application/json" },
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    // @ts-expect-error -- duplex required by undici for streamed request bodies
    duplex: "half",
  });
  const body = await res.arrayBuffer();
  return new NextResponse(body, { status: res.status, headers: res.headers });
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path);
}
