"use client";

/**
 * Top-of-tree error boundary. Catches errors that happen inside the root
 * layout itself (e.g. theme provider, navbar). Must include <html> + <body>
 * since the layout that normally provides them is the thing that crashed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0b0b0c",
          color: "#fafaf9",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#a8a29e",
            }}
          >
            Critical Error
          </p>
          <h1 style={{ fontSize: 36, margin: "12px 0 8px" }}>
            The atelier is briefly offline.
          </h1>
          <p style={{ color: "#a8a29e", lineHeight: 1.5 }}>
            Something went wrong loading the site shell. Please refresh — if it
            persists, get in touch at hello@bagsart.store.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: 16,
                fontSize: 11,
                fontFamily: "monospace",
                color: "#71717a",
              }}
            >
              Reference · {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              background: "#C9A961",
              color: "#000",
              border: 0,
              padding: "10px 20px",
              borderRadius: 8,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
