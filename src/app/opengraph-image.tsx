import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "OpenProposal - Proposals, E-Signatures & Payments";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FAFAFA 0%, #F4F4F5 50%, #FAFAFA 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {/* Paper airplane icon */}
          <div
            style={{
              width: 80,
              height: 80,
              backgroundColor: "white",
              borderRadius: 16,
              border: "2px solid #E4E4E7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 24,
              fontSize: 40,
            }}
          >
            ✈️
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#18181B",
              letterSpacing: "-0.02em",
            }}
          >
            OpenProposal
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "#52525B",
            marginBottom: 50,
            textAlign: "center",
          }}
        >
          Proposals, E-Signatures & Payments in One Workflow
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              border: "1px solid #E4E4E7",
              padding: "12px 24px",
              borderRadius: 30,
              fontSize: 18,
              color: "#18181B",
            }}
          >
            ✓ Drag & Drop Builder
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              border: "1px solid #E4E4E7",
              padding: "12px 24px",
              borderRadius: 30,
              fontSize: 18,
              color: "#18181B",
            }}
          >
            ✓ E-Signatures
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              border: "1px solid #E4E4E7",
              padding: "12px 24px",
              borderRadius: 30,
              fontSize: 18,
              color: "#18181B",
            }}
          >
            ✓ Payment Collection
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            color: "#71717A",
          }}
        >
          sendprop.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
