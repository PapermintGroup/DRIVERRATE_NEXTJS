import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import NavBack from "../components/NavBack";

export default function Subscribe() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentNotified, setPaymentNotified] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  const [popUrl, setPopUrl] = useState(""); // State for Proof of Payment URL
  const [uploading, setUploading] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function loadUser() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (data.ok) {
          setUser(data.user);
          // Generates a unique reference using User ID and a random 4-digit number
          setPaymentRef(`DR-${data.user.id}-${Math.floor(1000 + Math.random() * 9000)}`);
        }
      } catch (err) {
        console.error("User fetch error");
      }
    }
    loadUser();
  }, []);

  const handlePopUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setPopUrl(data.url);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  const handleNotifyEFT = async () => {
    if (!user) {
      router.push("/login?redirect=/subscribe");
      return;
    }
    
    if (!popUrl) {
      alert("Please upload your Proof of Payment before submitting.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscribe/notify-eft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: user.id, 
          reference: paymentRef,
          popUrl: popUrl // Passing the uploaded image URL to the backend
        }),
      });

      if (res.ok) {
        setPaymentNotified(true);
      } else {
        alert("Could not send notification. Please try again.");
      }
    } catch (err) {
      alert("Error sending notification.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <NavBack />
      <Head>
        <title>Subscribe via EFT — DriverRate</title>
      </Head>

      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: "28px", color: "#1e293b" }}>Premium Subscription</h1>
        <p style={{ color: "#64748b" }}>Pay <b>R59.99 once off</b> via EFT to unlock all driver details.</p>
      </div>

      <div style={{ 
        border: "2px solid #2d9a4a", 
        borderRadius: "16px", 
        padding: "30px", 
        background: "#fff",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
      }}>
        {!paymentNotified ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Step 1: Banking Details</h3>
              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", lineHeight: "1.8" }}>
                <div><b>Bank:</b> Capitec Business Account</div>
                <div><b>Acc Holder:</b> Runnit Pty Ltd</div>
                <div><b>Acc Number:</b> 1054733732</div>
                <div><b>Branch Code:</b> 450105</div>
                <div><b>Reference:</b> <span style={{ color: "#c53030", fontWeight: "bold" }}>{paymentRef}</span></div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Step 2: Upload Proof of Payment</h3>
              <div style={{ 
                border: "2px dashed #cbd5e1", 
                padding: "15px", 
                borderRadius: "8px", 
                textAlign: "center",
                background: popUrl ? "#f0fdf4" : "#fff" 
              }}>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={handlePopUpload} 
                  style={{ fontSize: "14px" }} 
                />
                {uploading && <p style={{ fontSize: "12px", color: "#2d9a4a" }}>Uploading...</p>}
                {popUrl && <p style={{ fontSize: "12px", color: "#2d9a4a", marginTop: "5px" }}>✅ File uploaded successfully</p>}
              </div>
            </div>

            <div style={{ marginBottom: 25 }}>
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Step 3: Notify Us</h3>
              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.4" }}>
                Transfer <b>R59.99</b> using the reference above, upload your POP, then click the button below.
              </p>
            </div>

            <button 
              onClick={handleNotifyEFT}
              disabled={loading || uploading}
              style={{ 
                width: "100%", 
                background: popUrl ? "#2d9a4a" : "#94a3b8", 
                color: "#fff", 
                padding: "16px", 
                borderRadius: "8px", 
                border: "none", 
                fontSize: "18px", 
                fontWeight: "bold", 
                cursor: popUrl ? "pointer" : "not-allowed"
              }}
            >
              {loading ? "Sending..." : "Submit Proof of Payment"}
            </button>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: "50px", marginBottom: "10px" }}>📨</div>
            <h2 style={{ color: "#2d9a4a", marginBottom: "10px" }}>Notification Received</h2>
            <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6" }}>
              Thank you! Your Proof of Payment has been uploaded. Your access will be activated once the <b>R59.99</b> reflects in our account.
            </p>
            <button 
              onClick={() => router.push("/")}
              style={{ marginTop: "20px", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          Questions?{" "}
          <Link href="/contact" style={{ color: "#2d9a4a", textDecoration: "none", fontWeight: "bold" }}>
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}