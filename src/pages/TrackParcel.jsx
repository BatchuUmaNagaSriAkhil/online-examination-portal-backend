import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';
import MapView from '../components/MapView';
import StatusTimeline from '../components/StatusTimeline';

// Route: /track  (enter a tracking ID)  and /track/:trackingId (view it)
const TrackParcel = () => {
  const { trackingId: paramId } = useParams();
  const navigate = useNavigate();
  const [inputId, setInputId] = useState(paramId || '');
  const [parcel, setParcel] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  const search = async (id) => {
    setError('');
    setParcel(null);
    try {
      const [{ data: parcelData }, { data: eventsData }] = await Promise.all([
        api.get(`/parcels/${id}`),
        api.get(`/parcels/${id}/timeline`),
      ]);
      setParcel(parcelData);
      setEvents(eventsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Parcel not found');
    }
  };

  useEffect(() => {
    if (paramId) search(paramId);
  }, [paramId]);

  useEffect(() => {
    if (!parcel) return;

    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit('join:parcel', parcel.trackingId);

    socket.on('status:update', ({ parcel: updated, event }) => {
      if (updated.trackingId === parcel.trackingId) {
        setParcel(updated);
        setEvents((prev) => [...prev, event]);
      }
    });

    socket.on('location:update', ({ trackingId, location }) => {
      if (trackingId === parcel.trackingId) {
        setParcel((prev) => ({ ...prev, currentLocation: location }));
      }
    });

    return () => {
      socket.emit('leave:parcel', parcel.trackingId);
      socket.off('status:update');
      socket.off('location:update');
      socket.disconnect();
    };
  }, [parcel?.trackingId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputId.trim()) navigate(`/track/${inputId.trim().toUpperCase()}`);
  };

  return (
    <div className="page">
      <h2>Track a parcel</h2>
      <form className="track-search" onSubmit={handleSearch}>
        <input
          placeholder="Enter tracking ID e.g. TRK-AB12CD34"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
        />
        <button type="submit">Track</button>
      </form>

      {error && <p className="error">{error}</p>}

      {parcel && (
        <div className="parcel-details">
          <div className="parcel-summary">
            <h3>{parcel.trackingId}</h3>
            <p><strong>Status:</strong> <span className={`badge status-${parcel.status}`}>{parcel.status.replace(/_/g, ' ')}</span></p>
            <p><strong>From:</strong> {parcel.sender.name}, {parcel.sender.address}</p>
            <p><strong>To:</strong> {parcel.receiver.name}, {parcel.receiver.address}</p>
            {parcel.estimatedDelivery && (
              <p><strong>Estimated delivery:</strong> {new Date(parcel.estimatedDelivery).toLocaleDateString()}</p>
            )}
          </div>

          <MapView
            lat={parcel.currentLocation?.lat}
            lng={parcel.currentLocation?.lng}
            label={parcel.trackingId}
          />

          <h4>Tracking history</h4>
          <StatusTimeline events={events} />
        </div>
      )}
    </div>
  );
};

export default TrackParcel;
