import { NextResponse } from "next/server";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMzRnMWEzMzY3QHNyaXQuYWMuaW4iLCJleHAiOjE3ODAxMjU0NzAsImlhdCI6MTc4MDEyNDU3MCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjhlZmExMGUzLWM3ZDgtNGEzMS1hMjM3LTNjM2E0NzI0NjRiZiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImtpcmFuIGt1bWFyIiwic3ViIjoiOGZhY2RlYjEtNDRkMS00YWVkLTlmNjgtMmE3ZGUyMDUzOWNhIn0sImVtYWlsIjoiMjM0ZzFhMzM2N0Bzcml0LmFjLmluIiwibmFtZSI6ImtpcmFuIGt1bWFyIiwicm9sbE5vIjoiMjM0ZzFhMzM2NyIsImFjY2Vzc0NvZGUiOiJTZGtqSkciLCJjbGllbnRJRCI6IjhmYWNkZWIxLTQ0ZDEtNGFlZC05ZjY4LTJhN2RlMjA1MzljYSIsImNsaWVudFNlY3JldCI6IlBaTmtycWNoS053WEV5eW4ifQ.mj-pE7hMzlpgo503NYDB63bHtUpPJ-NPR5iadQrG_5k";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const notification_type = searchParams.get("notification_type") || "";
  let apiUrl = `http://4.224.186.213/evaluation-service/notifications?limit=10&page=${page}`;
  if (notification_type) apiUrl += `&notification_type=${notification_type}`;
  const res = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return NextResponse.json(data);
}