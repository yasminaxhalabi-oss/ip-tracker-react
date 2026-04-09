import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// תיקון איקון Marker
const DefaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [ipInput, setIpInput] = useState("");
  const [ipData, setIpData] = useState({
    ip: "-",
    city: "-",
    region: "-",
    country_name: "-",
    org: "-",
  });
  const [position, setPosition] = useState([51.505, -0.09]);

  const handleSearch = async () => {
    try {
      let lat = null;
      let lon = null;
      const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

      // יצירת אובייקט חדש עם ברירות מחדל
      let newData = {
        ip: "-",
        city: "-",
        region: "-",
        country_name: "-",
        org: "-",
      };

      if (ipRegex.test(ipInput)) {
        // חיפוש לפי IP
        const response = await fetch(`https://ipapi.co/${ipInput}/json/`);
        const result = await response.json();
        newData = {
          ip: result.ip || ipInput,
          city: result.city || "-",
          region: result.region || "-",
          country_name: result.country_name || "-",
          org: result.org || "-",
        };
        lat = result.latitude;
        lon = result.longitude;
      } else {
        // חיפוש לפי שם מקום
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
            region: "-",        // תמיד ברירת מחדל
            country_name: "-",  // תמיד ברירת מחדל
            org: "-",           // תמיד ברירת מחדל
          };
        } else {
          alert("Location not found");
          return;
        }
      }

      // עדכון ה-state עם אובייקט חדש לחלוטין
      setIpData({ ...newData });

      if (lat && lon) setPosition([lat, lon]);
    } catch (error) {
      console.error(error);
      alert("Error fetching location");
    }
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "15px 20px",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    minWidth: "200px",
    textAlign: "center",
  };

  const fieldStyle = {
    margin: "5px 0",
    fontSize: "0.95rem",
  };

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
  };

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* חיפוש */}
      <div style={containerStyle}>
        <input
          type="text"
          placeholder="Enter IP or City"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          style={{ padding: "8px", width: "250px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "8px 15px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* כרטיסיות מידע */}
      <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 1000, display: "flex", gap: "20px" }}>
        <div style={cardStyle}>
          <div style={fieldStyle}><strong>IP/Name:</strong> {ipData.ip}</div>
          <div style={fieldStyle}><strong>City:</strong> {ipData.city}</div>
        </div>
        <div style={cardStyle}>
          <div style={fieldStyle}><strong>Region:</strong> {ipData.region}</div>
          <div style={fieldStyle}><strong>Country:</strong> {ipData.country_name}</div>
          <div style={fieldStyle}><strong>ISP:</strong> {ipData.org}</div>
        </div>
      </div>

      {/* המפה */}
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>{ipData.ip}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default App;