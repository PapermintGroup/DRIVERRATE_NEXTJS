import Link from "next/link";

export default function Support() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0fdf4",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#ffffff",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#065f46",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          Support DriverRate ❤️
        </h1>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "#4b5563",
            marginBottom: "24px",
          }}
        >
          DriverRate is free to use. If this platform helps you, you can support
          its growth with a once-off EFT contribution from as little as{" "}
          <strong>R10</strong>.
        </p>

        {/* EFT DETAILS */}
        <div
          style={{
            background: "#f0fdf4",
            border: "2px solid #2d9a4a",
            borderRadius: "12px",
            padding: "20px",
            fontSize: "14px",
            color: "#065f46",
          }}
        >
          <p style={{ margin: "0 0 10px", fontWeight: "bold" }}>
            EFT Banking Details
          </p>

          <p style={{ margin: "6px 0" }}>
            <strong>Bank:</strong> Capitec Business Account
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Account Name:</strong> Runnit Pty Ltd
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Account Number:</strong> 1054733732
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Branch Code:</strong> 450105
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Account Type:</strong> Cheque / Current
          </p>

          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
              background: "#dcfce7",
              padding: "8px",
              borderRadius: "8px",
            }}
          >
            <strong>Payment Reference:</strong> SUPPORT-DRIVERRATE
          </p>
        </div>

        {/* AMOUNTS */}
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            fontSize: "13px",
          }}
        >
          <Amount label="R10" />
          <Amount label="R25" />
          <Amount label="R50" />
          <Amount label="R100" />
        </div>

        {/* NOTE */}
        <p
          style={{
            marginTop: "20px",
            fontSize: "12px",
            color: "#6b7280",
            textAlign: "center",
            lineHeight: "1.5",
          }}
        >
          This is a voluntary, once-off contribution — not a subscription.
          <br />
          Thank you for helping keep DriverRate running ❤️
        </p>

        <Link
          href="/"
          style={{
            display: "block",
            marginTop: "24px",
            textAlign: "center",
            fontSize: "13px",
            color: "#2d9a4a",
            textDecoration: "underline",
          }}
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

function Amount({ label }) {
  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        textAlign: "center",
        background: "#ffffff",
        fontWeight: "bold",
        color: "#065f46",
      }}
    >
      {label}
    </div>
  );
}
