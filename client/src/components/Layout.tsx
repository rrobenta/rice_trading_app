import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.logo}>🌾</span>
          <span className={styles.brandName}>RiceMarket</span>
        </div>
        <div className={styles.navLinks}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Dashboard</NavLink>
          <NavLink to="/market" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Market</NavLink>
          <NavLink to="/listings" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Listings</NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Orders</NavLink>
          <NavLink to="/trades" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>Trades</NavLink>
        </div>
        <div className={styles.navUser}>
          <NavLink to="/profile" className={styles.userInfo}>
            <span className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</span>
            <span className={styles.userName}>{user?.name}</span>
          </NavLink>
          <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
        </div>
      </nav>
      <main className={styles.main}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
