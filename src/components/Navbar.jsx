import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">📦 Parcel Tracker</Link>
      <div className="nav-links">
        <Link to="/track">Track a Parcel</Link>
        {user?.role === 'customer' && <Link to="/dashboard">My Shipments</Link>}
        {user?.role === 'admin' && <Link to="/dashboard">Admin</Link>}
        {user?.role === 'agent' && <Link to="/dashboard">My Deliveries</Link>}
        {user ? (
          <>
            <span className="user-chip">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
