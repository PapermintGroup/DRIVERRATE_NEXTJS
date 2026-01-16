import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
  
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await res.json();
  
    if (data.ok) {
      if (data.user.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/");   // normal users go home
      }
    } else {
      alert(data.error || "Login failed");
    }
  }
  

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#2d9a4a", textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          placeholder="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        <button
          style={{
            background: "#2d9a4a",
            color: "#fff",
            border: "none",
            padding: "12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          Login
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Don't have an account? <a href="/register" style={{ color: "#2d9a4a", textDecoration: "none" }}>Register</a>
      </p>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "16px",
  outline: "none"
};
