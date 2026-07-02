import { ImageResponse } from "next/og";

// Site-wide default OG image — served at /opengraph-image and used by any
// page that doesn't declare its own via `openGraph.images`. Rendered at
// request time so we can keep the design in code (no PNG shipping in git).

export const runtime = "edge";
export const alt = "BagsArt — Crafted Bags, Reimagined";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0b0b0c 0%, #1a1614 55%, #2a1f18 100%)",
          color: "#fafaf7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#c9a961",
            }}
          />
          <div style={{ fontSize: 34, letterSpacing: 6 }}>BAGSART</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.05,
              fontWeight: 400,
              maxWidth: 900,
              letterSpacing: -1,
            }}
          >
            Leather goods, <span style={{ color: "#c9a961" }}>built to last</span>.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(250,250,247,0.72)",
              maxWidth: 800,
              lineHeight: 1.35,
            }}
          >
            Hand-stitched bags from a small studio in Lahore. Full-grain
            leather. Made in small batches.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "rgba(250,250,247,0.55)",
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span>Studio · Lahore</span>
          <span>bagsart</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
