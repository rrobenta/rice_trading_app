import { Outlet, NavLink, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
  { to: '/market', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Market' },
  { to: '/listings', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', label: 'Listings' },
  { to: '/orders', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4', label: 'Orders' },
  { to: '/profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'Profile' },
];

export default function AppShell() {
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      <div className="page">
        <Outlet />
      </div>
      <nav className="bottom-nav">
        {TABS.map(({ to, icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={`nav-item${isActive ? ' active' : ''}`}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
