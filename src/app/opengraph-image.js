import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "ARICT GPA Calculator for Rajarata University, Faculty of Applied Sciences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Telegram and some apps crop link previews to the centre square (about 630px wide here), so every
// important element is centred inside that square. The wide canvas only adds background around it.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 55%, #3a0a0c 0%, #0a0a0b 62%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 560 }}>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, lineHeight: 1, letterSpacing: -6, color: "#e5484d" }}>ARICT</div>
          <div style={{ display: "flex", fontSize: 150, fontWeight: 800, lineHeight: 1, letterSpacing: -6 }}>GPA</div>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.1, letterSpacing: -3 }}>Calculator</div>
          <div style={{ display: "flex", width: 72, height: 5, marginTop: 30, borderRadius: 3, background: "#e5484d" }} />
          <div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "rgba(255,255,255,0.72)", textAlign: "center" }}>
            Rajarata University · Applied Sciences
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 26, fontWeight: 700, color: "#e5484d" }}>gpa.arict.lk</div>
        </div>
      </div>
    ),
    size,
  );
}
