// app/api/[...path]/route.js
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "Cette route d'API n'existe pas." },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Cette route d'API n'existe pas." },
    { status: 404 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: "Cette route d'API n'existe pas." },
    { status: 404 }
  );
}
