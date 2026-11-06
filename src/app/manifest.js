export const dynamic = "force-static";

export default function manifest() {
  return {
    name: "ARICT GPA Calculator",
    short_name: "ARICT GPA",
    description: "Semester and overall GPA calculator for the Faculty of Applied Sciences, Rajarata University of Sri Lanka.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [{ src: "/icon.png", type: "image/png", sizes: "any" }],
  };
}
