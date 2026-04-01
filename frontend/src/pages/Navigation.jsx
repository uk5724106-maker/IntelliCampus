import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Navigation.css';

// Fix for default marker icons in Leaflet with webpack/vite
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LOCATIONS = [
  { id: 'lib', name: 'Central Library', coords: [23.2599, 77.4126] },
  { id: 'cs-dept', name: 'CS Department', coords: [23.2605, 77.4110] },
  { id: 'cafeteria', name: 'Campus Cafeteria', coords: [23.2585, 77.4130] }
];

function RecenterMap({ coords }) {
  const map = useMap();
  map.setView(coords, 17);
  return null;
}

export default function Navigation() {
  // Approximate coordinates for IES University, Bhopal (for dev purposes)
  const defaultCenter = [23.2599, 77.4126];
  const [target, setTarget] = useState(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    if (val) {
      const loc = LOCATIONS.find(l => l.id === val);
      if (loc) setTarget(loc);
    } else {
      setTarget(null);
    }
  };

  return (
    <div className="nav-wrapper animate-fade-in">
      <header className="nav-header glass-panel">
        <h2>📍 Smart Navigation</h2>
        <div className="search-box">
          <select className="input-base" onChange={handleSearch}>
            <option value="">Select Destination...</option>
            {LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => alert("QR Scanner launching...")}>
            Scan QR
          </button>
        </div>
      </header>

      <div className="map-container">
        <MapContainer center={defaultCenter} zoom={16} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {target && <RecenterMap coords={target.coords} />}
          
          {LOCATIONS.map(loc => (
            <Marker key={loc.id} position={loc.coords}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
