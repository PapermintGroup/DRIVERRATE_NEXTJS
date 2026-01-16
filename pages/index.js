import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Load drivers
    async function loadDrivers() {
      const res = await fetch("/api/drivers", { cache: "no-store" });
      const data = await res.json();
      const list = data.drivers || data;
      setDrivers(Array.isArray(list) ? list : []);
    }

    // Load current user
    async function loadUser() {
      try {
        const res = await fetch("/api/me", { cache: "no-store", credentials: "include" });
        const data = await res.json();
        setUser(data.ok ? data.user : null);
      } catch (e) {
        console.error("Failed to load user", e);
        setUser(null);
      }
    }

    loadDrivers();
    loadUser();
  }, []);

  // COUNTDOWN TIMER LOGIC
  useEffect(() => {
    if (user && user.paymentRequested && !user.isSubscribed) {
      const updateTimer = () => {
        // Fallback to current time if updatedAt is missing
        const requestDate = user.updatedAt ? new Date(user.updatedAt).getTime() : new Date().getTime();
        const targetDate = requestDate + (24 * 60 * 60 * 1000);
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("Awaiting Final Admin Check");
        }
      };

      updateTimer(); // Run immediately on load
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/";
  };

  const getRating = (driver) => {
    if (!driver.reviews || driver.reviews.length === 0) return 0;
    const sum = driver.reviews.reduce(
      (acc, r) =>
        acc +
        (r.punctuality +
          r.cleanliness +
          r.trustworthiness +
          r.safety +
          r.communication +
          r.reliability) /
          6,
      0
    );
    return sum / driver.reviews.length;
  };
  const handleSupportUs = () => {
    window.location.href = "/support";
  };
  

  const processedDrivers = drivers
    .filter((d) => {
      const search = searchTerm.toLowerCase();
      return (
        d.name?.toLowerCase().includes(search) ||
        d.serviceAreas?.toLowerCase().includes(search) ||
        d.service_areas?.toLowerCase().includes(search) ||
        d.companyName?.toLowerCase().includes(search) ||
        d.company_name?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === "highest") return getRating(b) - getRating(a);
      if (sortBy === "lowest") return getRating(a) - getRating(b);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f0fdf4", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* SUBSCRIPTION STATUS BAR */}
      {user && (
        <div style={{
          background: user.isSubscribed ? "#dcfce7" : (user.paymentRequested ? "#fef3c7" : "#fee2e2"),
          color: user.isSubscribed ? "#166534" : (user.paymentRequested ? "#92400e" : "#991b1b"),
          padding: "10px 16px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: "bold",
          borderBottom: `1px solid ${user.isSubscribed ? "#bbf7d0" : (user.paymentRequested ? "#fde68a" : "#fecaca")}`
        }}>
          {user.isSubscribed ? (
            "✅ Subscribed Account"
          ) : user.paymentRequested ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
              <span>⏳ Payment Pending Approval</span>
              {timeLeft && (
                <span style={{ background: '#92400e', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  Est. Approval: {timeLeft}
                </span>
              )}
            </div>
          ) : (
            "❌ Not Subscribed - Listing restricted"
          )}

          {!user.isSubscribed && !user.paymentRequested && (
            <Link 
              href="/subscribe" 
              style={{ 
                marginLeft: "12px", 
                textDecoration: "underline", 
                color: "#991b1b",
                background: "rgba(255,255,255,0.3)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Fix Now for R59.99
            </Link>
          )}
        </div>
      )}

      {/* FIXED HEADER */}
      <header
        style={{
          background: "#2d9a4a",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          DriverRate
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {user ? (
            <>
              <span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap" }}>
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 12px",
                  background: "#fff",
                  color: "#dc2626",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: "6px 12px",
                  background: "#fff",
                  color: "#2d9a4a",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Login
              </Link>

              <Link
                href="/register"
                style={{
                  padding: "6px 12px",
                  background: "#fff",
                  color: "#2d9a4a",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <div style={{ flex: 1 }}>
        <section style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: "18px", color: "#065f46", maxWidth: "600px", margin: "0 auto" }}>
            Find trusted lift-club drivers rated for punctuality, safety, and reliability.
          </p>
        </section>

        {/* Search and Sort Bar */}
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto 20px",
            padding: "0 20px",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Search name, area, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 2,
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #2d9a4a",
              outline: "none",
            }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "8px",
              border: "2px solid #2d9a4a",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="latest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {/* Drivers List */}
        <main style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 40px" }}>
          <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>
            {searchTerm ? `Results (${processedDrivers.length})` : "All Drivers"}
          </h2>

          {processedDrivers.length === 0 ? (
            <p>No drivers found.</p>
          ) : (
            <ul
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                padding: 0,
                listStyle: "none",
              }}
            >
              {processedDrivers.map((driver) => {
                const rating = getRating(driver);
                const reviewCount = driver.reviews?.length || 0;
                return (
                  <li
                    key={driver.id}
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "10px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: "bold" }}>{driver.name}</h3>
                    <p style={{ margin: "0 0 5px", color: "#4b5563" }}>
                      {driver.companyName || driver.company_name || "Independent Driver"}
                    </p>
                    <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#6b7280" }}>
                      📍 {driver.serviceAreas || driver.service_areas || "Global"}
                    </p>
                    <p style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: "bold", color: "#f39c12" }}>
                      ★ {rating > 0 ? rating.toFixed(1) : "N/A"} 
                      <span style={{ color: "#6b7280", fontWeight: "normal", fontSize: "12px", marginLeft: "5px" }}>
                        ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </p>
                    <Link
                      href={`/profile/${driver.id}`}
                      style={{ color: "#2d9a4a", fontWeight: "bold", textDecoration: "underline" }}
                    >
                      View Profile
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      </div>

      <footer
  style={{ 
    textAlign: "center", 
    padding: "32px 24px", 
    fontSize: "14px", 
    color: "#065f46", 
    background: "#fff",
    borderTop: "1px solid #dcfce7" 
  }}
>
  {/* SUPPORT US */}
  <div style={{ marginBottom: "16px" }}>
    <button
      onClick={handleSupportUs}
      style={{
        padding: "10px 18px",
        background: "#2d9a4a",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        fontWeight: "bold",
        fontSize: "14px",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      }}
    >
      ❤️Click to Support DriverRate❤️
    </button>
  </div>

  <div style={{ marginBottom: "8px" }}>
    © {new Date().getFullYear()} <strong>DriverRate</strong>. All rights reserved.
  </div>

  <div style={{ color: "#6b7280" }}>
    Powered by{" "}
    <a
      href="https://www.papermint.group"
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#2d9a4a", fontWeight: "bold", textDecoration: "none" }}
    >
      Papermint Group
    </a>
  </div>
</footer>
    </div>
  );
}