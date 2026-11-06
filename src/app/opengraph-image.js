import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "ARICT GPA Calculator for Rajarata University, Faculty of Applied Sciences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0a0a0b 55%, #3a0a0c 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
            <span>AR</span>
            <span style={{ color: "#e5484d" }}>ICT</span>
          </div>
          <div style={{ fontSize: 26, color: "#e5484d", fontWeight: 700 }}>gpa.arict.lk</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>
            <span style={{ color: "#e5484d" }}>ARICT</span>
          </div>
          <div style={{ display: "flex", fontSize: 112, fontWeight: 800, lineHeight: 1.05, letterSpacing: -4 }}>GPA Calculator</div>
          <div style={{ marginTop: 28, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>
            Faculty of Applied Sciences, Rajarata University of Sri Lanka
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>
          {["Semester & overall GPA", "PDF report & restore", "No sign-in"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 22px", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 999 }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
