import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json().catch(() => ({}));
        const { password } = body;

        if (!password || typeof password !== "string") {
            return NextResponse.json({ success: false, message: "Password is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.id }
        });

        if (!user || !user.password) {
            return NextResponse.json({ success: false, message: "User not found or invalid account" }, { status: 404 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ success: false, message: "Incorrect password" }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: "Password verified" });
    } catch (error: any) {
        console.error("Password verification error:", error);
        return NextResponse.json({ success: false, message: error?.message || "Internal server error" }, { status: 500 });
    }
}
