import { ImageResponse } from "next/og";

/**
 * Apple touch icon.
 *
 * Generated rather than committed as a binary: `apple-icon` only accepts
 * raster formats, and a checked-in PNG is one more thing to forget when the
 * brand colour changes. Satori has no SVG support, so the paw is built from
 * rounded divs — the same shapes as icon.svg, by other means.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARIGOLD = "#C8540F";

export default function AppleIcon() {
  const toe = (left: number, top: number, rotate: number) => ({
    position: "absolute" as const,
    left,
    top,
    width: 34,
    height: 44,
    borderRadius: "50%",
    background: "#FFFFFF",
    transform: `rotate(${rotate}deg)`,
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: MARIGOLD,
      }}
    >
      <div style={toe(40, 46, -18)} />
      <div style={toe(73, 32, 0)} />
      <div style={toe(106, 46, 18)} />
      <div
        style={{
          position: "absolute",
          left: 53,
          top: 94,
          width: 74,
          height: 60,
          borderRadius: "50%",
          background: "#FFFFFF",
        }}
      />
    </div>,
    size,
  );
}
