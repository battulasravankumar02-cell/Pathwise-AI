import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Timer, BarChart2, MessageSquare, BookOpen } from 'lucide-react';

const MOBILE_NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/targets', icon: CheckSquare, label: 'Targets' },
  { to: '/timer', icon: Timer, label: 'Timer' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/ai-assistant', icon: MessageSquare, label: 'AI' },
  { to: '/academic', icon: BookOpen, label: 'Academic' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile navigation">
      <div className="mobile-nav-items">
        {MOBILE_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <item.icon size={20} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
