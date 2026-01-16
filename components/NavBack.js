import { useRouter } from "next/router";
import Link from "next/link";

export default function NavBack() {
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }}>
      <button
        onClick={() => router.back()}
        style={{
          background: "#e5e7eb",
          border: "none",
          padding: "8px 14px",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "bold"
        }}
      >
        ← Back
      </button>

      
    </div>
  );
}
