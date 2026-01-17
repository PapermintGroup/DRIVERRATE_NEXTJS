import Head from "next/head";
import prisma from "../../lib/prisma";
import { useState, useEffect } from "react";
import Link from "next/link";
import NavBack from "../../components/NavBack";

export async function getServerSideProps({ params }) {
  const id = parseInt(params.id);

  try {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: { 
        reviews: {
          include: { user: true },
          orderBy: { createdAt: "desc" }
        } 
      },
    });

    if (!driver) return { notFound: true };

    const reviews = driver.reviews || [];

    const averages = {
      punctuality: 0,
      cleanliness: 0,
      trustworthiness: 0,
      safety: 0,
      communication: 0,
      reliability: 0,
      overall: "0.0"
    };

    if (reviews.length > 0) {
      let totalSum = 0;
      reviews.forEach(r => {
        averages.punctuality += r.punctuality || 0;
        averages.cleanliness += r.cleanliness || 0;
        averages.trustworthiness += r.trustworthiness || 0;
        averages.safety += r.safety || 0;
        averages.communication += r.communication || 0;
        averages.reliability += r.reliability || 0;
        totalSum += (
          (r.punctuality || 0) +
          (r.cleanliness || 0) +
          (r.trustworthiness || 0) +
          (r.safety || 0) +
          (r.communication || 0) +
          (r.reliability || 0)
        ) / 6;
      });

      Object.keys(averages).forEach(key => {
        if (key !== "overall") {
          averages[key] = (averages[key] / reviews.length).toFixed(1);
        }
      });

      averages.overall = (totalSum / reviews.length).toFixed(1);
    }

    return {
      props: {
        driver: JSON.parse(JSON.stringify(driver)),
        reviews: JSON.parse(JSON.stringify(reviews)),
        scores: averages,
      },
    };
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return { notFound: true };
  }
}

export default function Profile({ driver, reviews = [], scores = {} }) {
  // EARLY HARD GUARD
  if (!driver) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial" }}>
        <NavBack />
        <h2 style={{ color: "#991b1b" }}>Driver Profile Not Found</h2>
        <p>This profile may have been removed or does not exist.</p>
        <Link href="/" style={{ color: "#2d9a4a", fontWeight: "bold" }}>
          Return to Home
        </Link>
      </div>
    );
  }

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadUser() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = await res.json();
        setUser(data.ok ? data.user : null);
      } catch {
        setUser(null);
      }
    }
    loadUser();
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReport = () => {
    const subject = encodeURIComponent(`HIGH RISK REPORT: ${driver?.name}`);
    const body = encodeURIComponent(
      `Admin, I am reporting driver ${driver?.name} (ID: ${driver?.id}) as high risk.\n\nReason: `
    );
    window.location.href = `mailto:admin@driverrate.co.za?subject=${subject}&body=${body}`;
  };

  const hasReviewed = user && reviews.some(r => r.userId === user.id);
  const isSubscriber = user?.isSubscribed === true || user?.role === "admin";

  const SocialLink = ({ href, icon, label }) => {
    if (!href || !isSubscriber) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={label}
        style={{ 
          fontSize: "20px", 
          textDecoration: "none", 
          filter: "grayscale(0.2)",
          transition: "transform 0.2s" 
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.2)"}
        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        {icon}
      </a>
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16, fontFamily: "Arial, sans-serif" }}>
      <NavBack />

      <Head>
        <title>{driver?.name || "Driver"} — DriverRate</title>
        <meta property="og:title" content={`Rate ${driver?.name} on DriverRate`} />
        <meta property="og:description" content={`Current Rating: ★ ${scores?.overall || "0.0"}/5. Notify others about high-risk drivers or rate your experience.`} />
        <meta property="og:image" content={driver?.profilePhoto || "/placeholder.png"} />
      </Head>

      {/* Driver Header */}
      <div style={{ display: "flex", gap: 24, borderBottom: "2px solid #eee", paddingBottom: 24, flexWrap: "wrap" }}>
        <div style={{ position: 'relative' }}>
          <img
            src={driver?.profilePhoto || "/placeholder.png"}
            style={{ borderRadius: 8, objectFit: "cover", background: "#f4f4f4", width: 160, height: 160 }}
            alt={driver?.name || "Driver Profile"}
          />
          {driver?.idPic && (
             <div style={{ 
               position: 'absolute', 
               bottom: '-10px', 
               left: '50%', 
               transform: 'translateX(-50%)', 
               background: '#2d9a4a', 
               color: 'white', 
               fontSize: '10px', 
               padding: '4px 8px', 
               borderRadius: '12px', 
               fontWeight: 'bold',
               whiteSpace: 'nowrap',
               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
             }}>
               ✅ ID VERIFIED
             </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h1 style={{ color: "#2d9a4a", margin: "0 0 8px 0" }}>{driver?.name}</h1>
            
            <div style={{ display: "flex", gap: "12px", padding: "4px" }}>
              <SocialLink href={driver?.facebook} icon="📘" label="Facebook" />
              <SocialLink href={driver?.instagram} icon="📸" label="Instagram" />
              <SocialLink href={driver?.twitter || driver?.x} icon="🐦" label="X (Twitter)" />
              <SocialLink href={driver?.whatsapp} icon="💬" label="WhatsApp" />
            </div>
          </div>

          <div style={{ fontWeight: "bold", color: "#555" }}>{driver?.companyName || "Independent Driver"}</div>
          <div style={{ marginTop: 8 }}><strong>Areas:</strong> {driver?.serviceAreas || "Not specified"}</div>

          <div style={{ display: "flex", gap: "10px", marginTop: 12 }}>
            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? "#166534" : "#eefaf0",
                color: copied ? "#fff" : "#2d9a4a",
                border: "1px solid #2d9a4a",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold",
                transition: "0.2s"
              }}
            >
              {copied ? "✅ Link Copied!" : "🔗 Copy Share Link"}
            </button>

            <button
              onClick={handleReport}
              style={{
                background: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fee2e2",
                padding: "8px 14px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "bold"
              }}
            >
              🚩 Flag High Risk
            </button>
          </div>

          {/* CLEAR PAYWALL SECTION */}
          <div style={{ marginTop: 20 }}>
            {isSubscriber ? (
              <div style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                background: '#f0fdf4', 
                border: '1px solid #2d9a4a',
                fontSize: '14px' 
              }}>
                <div style={{ color: '#166534', fontWeight: 'bold', marginBottom: '10px' }}>✅ Subscriber Access Unlocked</div>
                <div style={{ marginBottom: '6px' }}>📞 <b>Phone:</b> {driver?.phone || "Not provided"}</div>
                <div style={{ marginBottom: '6px' }}>✉️ <b>Email:</b> {driver?.email || "Not provided"}</div>
                <div>🛣️ <b>Specific Routes:</b> {driver?.routes || "Contact driver for details"}</div>
              </div>
            ) : (
              <div style={{ 
                padding: '24px', 
                borderRadius: '12px', 
                background: '#fef2f2', 
                border: '2px solid #fee2e2',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                <h3 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Driver Information Locked</h3>
                <p style={{ fontSize: '14px', color: '#7f1d1d', marginBottom: '16px', lineHeight: '1.5' }}>
                  The phone number, email address, and vehicle photos are only available to active subscribers.
                </p>
                <Link href="/subscribe" style={{ 
                  display: 'inline-block',
                  background: '#2d9a4a', 
                  color: '#fff', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  fontSize: '15px', 
                  fontWeight: 'bold'
                }}>
                  Click here to subscribe for R59.99/pm
                </Link>
              </div>
            )}
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px", marginTop: 20, fontSize: "13px" }}>
            <div>Punctuality: <span style={{color:"#f39c12"}}>★ {scores?.punctuality || "0.0"}</span></div>
            <div>Safety: <span style={{color:"#f39c12"}}>★ {scores?.safety || "0.0"}</span></div>
            <div>Cleanliness: <span style={{color:"#f39c12"}}>★ {scores?.cleanliness || "0.0"}</span></div>
            <div>Comm: <span style={{color:"#f39c12"}}>★ {scores?.communication || "0.0"}</span></div>
            <div>Trust: <span style={{color:"#f39c12"}}>★ {scores?.trustworthiness || "0.0"}</span></div>
            <div>Reliability: <span style={{color:"#f39c12"}}>★ {scores?.reliability || "0.0"}</span></div>
          </div>
          <div style={{ marginTop: 12, fontSize: "1.2rem", fontWeight: "bold" }}>
            Overall: <span style={{ color: "#2d9a4a" }}>{scores?.overall || "0.0"} / 5</span>
          </div>
        </div>
      </div>

      {/* VEHICLE GALLERY */}
      {isSubscriber && driver?.vehiclePics && (
        <section style={{ marginTop: 32 }}>
          <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '8px', color: '#444' }}>
            Vehicle Verification
          </h3>
          <div style={{ 
            marginTop: '12px', 
            background: '#f9f9f9', 
            padding: '16px', 
            borderRadius: '8px' 
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '12px' 
            }}>
              {(() => {
                try {
                  const images = JSON.parse(driver.vehiclePics);
                  return Array.isArray(images) ? images.map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`Vehicle View ${idx + 1}`} 
                      style={{ 
                        width: '100%', 
                        height: '200px', 
                        borderRadius: '6px', 
                        objectFit: 'cover', 
                        display: 'block',
                        border: '1px solid #ddd'
                      }} 
                    />
                  )) : null;
                } catch (e) {
                  return (
                    <img 
                      src={driver.vehiclePics} 
                      alt="Verified Vehicle" 
                      style={{ width: '100%', borderRadius: 8, maxHeight: '500px', objectFit: 'contain' }} 
                    />
                  );
                }
              })()}
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '12px', textAlign: 'center' }}>
              Standard vehicle used for the routes listed above. Images verified for security.
            </p>
          </div>
        </section>
      )}

      {/* Reviews List */}
      <section style={{ marginTop: 32 }}>
        <h2>Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p style={{ color: "#777" }}>No reviews yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} style={{ border: "1px solid #eee", padding: 16, borderRadius: 8, marginTop: 12, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "bold", color: "#333", fontSize: "15px" }}>
                    {r.user?.name || "Anonymous User"} 
                    <span style={{ marginLeft: 8, fontSize: "11px", color: "#2d9a4a", background: "#eefaf0", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>
                      {r.user?.role || "user"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {mounted ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 15px", margin: "12px 0", fontSize: "12px", background: "#f9f9f9", padding: "10px", borderRadius: "6px", border: "1px solid #f0f0f0" }}>
                <span>🕒 Punc: <b>{r.punctuality}</b></span>
                <span>✨ Clean: <b>{r.cleanliness}</b></span>
                <span>🤝 Trust: <b>{r.trustworthiness}</b></span>
                <span>🛡️ Safety: <b>{r.safety}</b></span>
                <span>📞 Comm: <b>{r.communication}</b></span>
                <span>✅ Rel: <b>{r.reliability}</b></span>
              </div>

              <div style={{ marginTop: 8, color: "#444", lineHeight: "1.5" }}>
                {r.comment || <span style={{ color: "#999", fontStyle: "italic" }}>No comment provided.</span>}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Form Section */}
      <section style={{ marginTop: 32, padding: 20, background: "#f9f9f9", borderRadius: 8 }}>
        <h2>Leave a review</h2>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
          Help others by notifying them about high-risk drivers or praising great service.
        </p>
        {!mounted ? <p>Loading...</p> : !user ? (
          <p>Please <Link href="/login" style={{ color: "#2d9a4a", fontWeight: "bold" }}>Login</Link> to leave a review.</p>
        ) : hasReviewed ? (
          <p style={{ color: "#2d9a4a", fontWeight: "bold" }}>✅ You have already rated this driver.</p>
        ) : (
          <ReviewForm id={driver?.id} userId={user?.id} />
        )}
      </section>
    </div>
  );
}

function ReviewForm({ id, userId }) {
  async function submit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    const payload = {
      driverId: id,
      userId,
      punctuality: Number(data.punctuality),
      cleanliness: Number(data.cleanliness),
      trustworthiness: Number(data.trustworthiness),
      safety: Number(data.safety),
      communication: Number(data.communication),
      reliability: Number(data.reliability),
      comment: data.comment,
    };

    const res = await fetch("/api/reviews/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if ((await res.json()).ok) {
      alert("Thanks for your review");
      window.location.reload();
    } else {
      alert("Error submitting review");
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        <label style={labelStyle}>Punctuality<input type="number" name="punctuality" defaultValue="5" min="1" max="5" style={inputStyle} /></label>
        <label style={labelStyle}>Cleanliness<input type="number" name="cleanliness" defaultValue="5" min="1" max="5" style={inputStyle} /></label>
        <label style={labelStyle}>Trustworthiness<input type="number" name="trustworthiness" defaultValue="5" min="1" max="5" style={inputStyle} /></label>
        <label style={labelStyle}>Safety<input type="number" name="safety" defaultValue="5" min="1" max="5" style={inputStyle} /></label>
        <label style={labelStyle}>Communication<input type="number" name="communication" defaultValue="5" min="1" max="5" style={inputStyle} /></label>
        <label style={labelStyle}>Reliability<input type="number" name="reliability" defaultValue="5" min="1" max="5" style={inputStyle} /></label>
      </div>
      <textarea name="comment" rows="3" placeholder="Explain your experience (good or bad)..." style={{ ...inputStyle, resize: "vertical" }} />
      <button type="submit" style={{ background: "#2d9a4a", color: "#fff", padding: "12px", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>
        Submit review
      </button>
    </form>
  );
}

const labelStyle = { fontSize: "12px", fontWeight: "bold", color: "#666" };
const inputStyle = { padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%", boxSizing: "border-box" };