import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);
  return null;
}

function App() {
  const [ipInput, setIpInput] = useState("");
  const [ipData, setIpData] = useState({
    ip: "-",
    city: "-",
    region: "-",
    country_name: "-",
    org: "-",
    timezone: "-",
  });
  const [position, setPosition] = useState([51.505, -0.09]);

  const handleSearch = async () => {
    if (!ipInput.trim()) return;
    try {
      const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
      let newData = { ip: "-", city: "-", region: "-", country_name: "-", org: "-", timezone: "-" };
      let lat = null, lon = null;

      if (ipRegex.test(ipInput)) {
        const response = await fetch(`https://ipapi.co/${ipInput}/json/`);
        const result = await response.json();
        newData = {
          ip: result.ip || ipInput,
          city: result.city || "-",
          region: result.region || "-",
          country_name: result.country_name || "-",
          org: result.org || "-",
          timezone: result.timezone || "-",
        };
        lat = result.latitude;
        lon = result.longitude;
      } else {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ipInput)}&format=json&limit=1`
        );
        const result = await response.json();
        if (result.length > 0) {
          lat = parseFloat(result[0].lat);
          lon = parseFloat(result[0].lon);
          newData = {
            ip: ipInput,
            city: result[0].display_name,
            region: "-",
            country_name: "-",
            org: "-",
            timezone: "-",
          };
        } else {
          alert("Location not found");
          return;
        }
      }

      setIpData({ ...newData });
      if (lat && lon) setPosition([lat, lon]);
    } catch (error) {
      console.error(error);
      alert("Error fetching location");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{
        backgroundImage: `url("/images/pattern-bg-desktop.png")`,
        backgroundColor: "#4b5ce4",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "30px 20px 80px",
        textAlign: "center",
        position: "relative",
        zIndex: 10,
      }}>
        <h1 style={{
          color: "white",
          fontSize: "1.8rem",
          fontWeight: "700",
          margin: "0 0 24px",
          letterSpacing: "0.5px",
        }}>
          IP Address Tracker
        </h1>

        {/* Search Bar */}
        <div style={{
          display: "flex",
          maxWidth: "480px",
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          <input
            type="text"
            placeholder="Search for any IP address or domain"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              padding: "16px 20px",
              fontSize: "1rem",
              border: "none",
              outline: "none",
              color: "#333",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "16px 20px",
              background: "#1a1a2e",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: "1.4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#333"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#1a1a2e"}
          >
            ›
          </button>
        </div>
      </div>

      {/* INFO CARD */}
      <div style={{
        position: "relative",
        zIndex: 20,
        display: "flex",
        justifyContent: "center",
        marginTop: "-50px",
      }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 30px rgba(0,0,0,0.15)",
          display: "flex",
          maxWidth: "900px",
          width: "calc(100% - 40px)",
          overflow: "hidden",
        }}>
          {[
            { label: "IP ADDRESS", value: ipData.ip },
            { label: "LOCATION", value: ipData.city !== "-" ? `${ipData.city}${ipData.region !== "-" ? ", " + ipData.region : ""}` : "-" },
            { label: "TIMEZONE", value: ipData.timezone !== "-" ? `UTC ${ipData.timezone}` : "-" },
            { label: "ISP", value: ipData.org },
          ].map((item, i, arr) => (
            <div key={i} style={{
              flex: 1,
              padding: "28px 24px",
              borderRight: i < arr.length - 1 ? "1px solid #eee" : "none",
            }}>
              <div style={{
                fontSize: "0.65rem",
                fontWeight: "800",
                letterSpacing: "1.5px",
                color: "#999",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#1a1a2e",
                wordBreak: "break-word",
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />
          <MapUpdater position={position} />
          <Marker position={position} />
        </MapContainer>
      </div>
    </div>
  );
}

export default App;