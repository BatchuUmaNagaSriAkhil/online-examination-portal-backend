import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Default Leaflet marker icons don't load correctly with bundlers unless re-pointed like this.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Renders a live-updating marker for a parcel's current location.
const MapView = ({ lat, lng, label }) => {
  if (!lat || !lng) {
    return (
      <div className="map-placeholder">
        Live location isn't available yet — it appears once the parcel is picked up.
      </div>
    );
  }

  return (
    <MapContainer center={[lat, lng]} zoom={13} style={{ height: '360px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>{label || 'Current location'}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
