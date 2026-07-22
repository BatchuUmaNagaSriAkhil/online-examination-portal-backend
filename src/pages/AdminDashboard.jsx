import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);
  const [assigning, setAssigning] = useState({}); // { [parcelId]: agentId }

  const load = async () => {
    const [{ data: parcelData }, { data: userData }] = await Promise.all([
      api.get('/parcels'),
      api.get('/users?role=agent'),
    ]);
    setParcels(parcelData);
    setAgents(userData);
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (parcelId) => {
    const agentId = assigning[parcelId];
    if (!agentId) return;
    await api.patch(`/parcels/${parcelId}/assign`, { agentId });
    load();
  };

  return (
    <div className="page">
      <h2>Admin — All Parcels</h2>
      <table className="data-table">
        <thead>
          <tr><th>Tracking ID</th><th>Customer</th><th>Status</th><th>Assigned Agent</th><th>Assign</th><th></th></tr>
        </thead>
        <tbody>
          {parcels.map((p) => (
            <tr key={p._id}>
              <td>{p.trackingId}</td>
              <td>{p.customer?.name}</td>
              <td><span className={`badge status-${p.status}`}>{p.status.replace(/_/g, ' ')}</span></td>
              <td>{p.assignedAgent?.name || '—'}</td>
              <td>
                <select
                  value={assigning[p._id] || ''}
                  onChange={(e) => setAssigning({ ...assigning, [p._id]: e.target.value })}
                >
                  <option value="">Select agent</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
                <button onClick={() => handleAssign(p._id)}>Assign</button>
              </td>
              <td><Link to={`/track/${p.trackingId}`}>View</Link></td>
            </tr>
          ))}
          {parcels.length === 0 && <tr><td colSpan={6}>No parcels yet.</td></tr>}
        </tbody>
      </table>

      <p className="hint">
        To add delivery agents, create a staff account via <code>POST /api/users/staff</code>
        (role: "agent") — this endpoint is admin-only and intentionally not exposed as a public form.
      </p>
    </div>
  );
};

export default AdminDashboard;
