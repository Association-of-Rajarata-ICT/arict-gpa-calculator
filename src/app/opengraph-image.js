import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "ARICT GPA Calculator for Rajarata University, Faculty of Applied Sciences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Telegram crops link previews to the centre square (about 630px wide here), so the whole
// composition is a narrow centred column. The wide canvas only adds quiet background around it.
export default async function Image() {
  const logo = await readFile(path.join(process.cwd(), "public/brand/arict-wordmark-light.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  const bars = [46, 58, 52, 66, 72, 62, 78, 70];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#0a0a0b",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "radial-gradient(circle at 50% 38%, rgba(160,0,0,0.32) 0%, rgba(10,10,11,0) 55%)",
          }}
        />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, display: "flex", background: "#e5484d" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 560 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={232} height={42} alt="" />

          <div style={{ display: "flex", width: 40, height: 2, marginTop: 34, background: "#e5484d" }} />

          <div style={{ display: "flex", marginTop: 30, fontSize: 56, fontWeight: 700, letterSpacing: -1.5 }}>GPA Calculator</div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 22,
              lineHeight: 1.45,
              textAlign: "center",
              color: "rgba(255,255,255,0.62)",
            }}
          >
            Semester, cumulative and overall GPA
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 54, marginTop: 38 }}>
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: 14,
                  height: h * 0.7,
                  borderRadius: 3,
                  background: i < 6 ? "#e5484d" : "rgba(229,72,77,0.35)",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 38,
              paddingTop: 20,
              width: 440,
              justifyContent: "center",
              whiteSpace: "nowrap",
              borderTop: "1px solid rgba(255,255,255,0.14)",
              fontSize: 16,
              letterSpacing: 1.8,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            RAJARATA UNIVERSITY · APPLIED SCIENCES
          </div>
          <div style={{ display: "flex", marginTop: 10, fontSize: 18, fontWeight: 600, color: "#e5484d" }}>gpa.arict.lk</div>
        </div>
      </div>
    ),
    size,
  );
}
