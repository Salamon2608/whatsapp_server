import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

// Use nodejs runtime to allow file access
export const runtime = "nodejs";

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = "image/png";

// Image generation using logo.png
export default async function Icon() {
    try {
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        if (fs.existsSync(logoPath)) {
            const logoData = fs.readFileSync(logoPath);
            const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
            return new ImageResponse(
                (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoBase64}
                            alt="Logo"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        />
                    </div>
                ),
                {
                    ...size,
                }
            );
        }
    } catch (e) {
        console.error("Failed to generate logo icon", e);
    }

    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 20,
                    fontWeight: 800,
                    background: "#16a34a",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    borderRadius: "20%",
                    fontFamily: "sans-serif",
                }}
            >
                W
            </div>
        ),
        {
            ...size,
        }
    );
}
