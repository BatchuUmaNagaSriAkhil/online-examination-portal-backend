import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const emptyForm = {
  sender: { name: '', address: '', phone: '' },
  receiver: { name: '', address: '', phone: '' },
  weightKg: '',
  price: '',
  estimatedDelivery: '',
};

const CustomerDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const loadParcels = async () => {
    const { data } = await api.get('/parcels');
    setParcels(data);
  };

  useEffect(() => { loadParcels(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/parcels', { ...form, weightKg: Number(form.weightKg), price: Number(form.price) });
      setForm(emptyForm);
      setShowForm(false);
      loadParcels();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Shipments</h2>
        <button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : '+ New Shipment'}</button>
      </div>

      {showForm && (
        <form className="parcel-form" onSubmit={handleCreate}>
          {error && <p className="error">{error}</p>}
          <fieldset>
            <legend>Sender</legend>
            <input placeholder="Name" required value={form.sender.name}
              onChange={(e) => setForm({ ...form, sender: { ...form.sender, name: e.target.value } })} />
            <input placeholder="Address" required value={form.sender.address}
              onChange={(e) => setForm({ ...form, sender: { ...form.sender, address: e.target.value } })} />
            <input placeholder="Phone" required value={form.sender.phone}
              onChange={(e) => setForm({ ...form, sender: { ...form.sender, phone: e.target.value } })} />
          </fieldset>
          <fieldset>
            <legend>Receiver</legend>
            <input placeholder="Name" required value={form.receiver.name}
              onChange={(e) => setForm({ ...form, receiver: { ...form.receiver, name: e.target.value } })} />
            <input placeholder="Address" required value={form.receiver.address}
              onChange={(e) => setForm({ ...form, receiver: { ...form.receiver, address: e.target.value } })} />
            <input placeholder="Phone" required value={form.receiver.phone}
              onChange={(e) => setForm({ ...form, receiver: { ...form.receiver, phone: e.target.value } })} />
          </fieldset>
          <fieldset>
            <legend>Package</legend>
            <input type="number" step="0.01" placeholder="Weight (kg)" required value={form.weightKg}
              onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
            <input type="number" step="0.01" placeholder="Price" required value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input type="date" value={form.estimatedDelivery}
              onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} />
          </fieldset>
          <button type="submit">Create Shipment</button>
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr><th>Tracking ID</th><th>To</th><th>Status</th><th>Created</th><th></th></tr>
        </thead>
        <tbody>
          {parcels.map((p) => (
            <tr key={p._id}>
              <td>{p.trackingId}</td>
              <td>{p.receiver.name}</td>
              <td><span className={`badge status-${p.status}`}>{p.status.replace(/_/g, ' ')}</span></td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              <td><Link to={`/track/${p.trackingId}`}>View</Link></td>
            </tr>
          ))}
          {parcels.length === 0 && <tr><td colSpan={5}>No shipments yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerDashboard;
