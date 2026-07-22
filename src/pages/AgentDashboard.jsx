import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_FLOW = ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed'];

const AgentDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [sharingId, setSharingId] = useState(null); // parcel currently broadcasting location
  const watchIdRef = useRef(null);

  const load = async () => {
    const { data } = await api.get('/parcels');
    setParcels(data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  const handleStatusChange = async (parcelId, status) => {
    await api.patch(`/parcels/${parcelId}/status`, { status });
    load();
  };

  const toggleLocationShare = (parcel) => {
    if (sharingId === parcel._id) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      setSharingId(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await api.patch(`/parcels/${parcel._id}/location`, { lat: latitude, lng: longitude });
      },
      (err) => console.error('Geolocation error', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setSharingId(parcel._id);
  };

  return (
    <div className="page">
      <h2>My Deliveries</h2>
      <table className="data-table">
        <thead>
          <tr><th>Tracking ID</th><th>Receiver</th><th>Status</th><th>Update status</th><th>Live location</th><th></th></tr>
        </thead>
        <tbody>
          {parcels.map((p) => (
            <tr key={p._id}>
              <td>{p.trackingId}</td>
              <td>{p.receiver.name}, {p.receiver.address}</td>
              <td><span className={`badge status-${p.status}`}>{p.status.replace(/_/g, ' ')}</span></td>
              <td>
                <select value={p.status} onChange={(e) => handleStatusChange(p._id, e.target.value)}>
                  {STATUS_FLOW.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </td>
              <td>
                <button onClick={() => toggleLocationShare(p)}>
                  {sharingId === p._id ? 'Stop sharing' : 'Share live location'}
                </button>
              </td>
              <td><Link to={`/track/${p.trackingId}`}>View</Link></td>
            </tr>
          ))}
          {parcels.length === 0 && <tr><td colSpan={6}>No parcels assigned to you yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default AgentDashboard;
