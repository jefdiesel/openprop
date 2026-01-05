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
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 32 32"
            fill="none"
            style={{ marginRight: 20 }}
          >
            <rect width="32" height="32" rx="8" fill="white" stroke="#E4E4E7" strokeWidth="1" />
            <path d="M22.5 9.5L9.5 15L14 17L22.5 9.5Z" fill="#18181B" />
            <path d="M22.5 9.5L14 17L16 21.5L22.5 9.5Z" fill="#18181B" />
            <path d="M14 17L16 21.5L14 23L12 17.5L14 17Z" fill="#18181B" opacity="0.7" />
          </svg>
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
            maxWidth: 800,
          }}
        >
          Proposals, E-Signatures & Payments in One Workflow
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 40,
          }}
        >
          {["Drag & Drop Builder", "E-Signatures", "Payment Collection"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: "white",
                  border: "1px solid #E4E4E7",
                  padding: "12px 24px",
                  borderRadius: 30,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    fill="#22C55E"
                  />
                </svg>
                <span style={{ color: "#18181B", fontSize: 18 }}>{feature}</span>
              </div>
            )
          )}
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
          openproposal.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
