import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dev Event - The Hub for Every Dev Event You Can't Miss";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #143d33 0%, #0a0a0a 60%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#5dfeca",
            letterSpacing: -2,
          }}
        >
          Dev Event
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 36,
            color: "#d1d5db",
          }}
        >
          The Hub for Every Dev Event You Can&apos;t Miss
        </div>
      </div>
    ),
    { ...size }
  );
}
