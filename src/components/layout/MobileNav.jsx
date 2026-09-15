import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Target, Award, Settings, Menu } from 'lucide-react';

export default function MobileNav({ onOpenMore }) {
  const location = useLocation();
  const navTrackRef = useRef(null);
  const activeTabRef = useRef(null);

  // Auto-scroll the active tab into the center of the viewport smoothly on route changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [location.pathname]);

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true, id: 'mobile-nav-home' },
    { to: '/learn', label: 'Learn', icon: BookOpen, end: false, id: 'mobile-nav-learn' },
    { to: '/roadmap', label: 'Roadmap', icon: Sparkles, end: false, id: 'mobile-nav-roadmap' },
    { to: '/goal-career', label: 'Career', icon: Target, end: false, id: 'mobile-nav-career' },
    { to: '/skill-quiz', label: 'Quiz', icon: Award, end: false, id: 'mobile-nav-quiz' },
    { to: '/settings', label: 'Settings', icon: Settings, end: false, id: 'mobile-nav-settings' },
  ];

  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile primary navigation">
      <div className="mobile-nav-bar" ref={navTrackRef}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            id={item.id}
            ref={(el) => {
              const isActive = item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);
              if (isActive) {
                activeTabRef.current = el;
              }
            }}
            className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <div className="mobile-tab-icon-wrap">
              <item.icon size={19} aria-hidden="true" />
            </div>
            <span className="mobile-tab-label">{item.label}</span>
          </NavLink>
        ))}

        {/* 7. MORE DRAWER BUTTON */}
        <button
          type="button"
          id="mobile-nav-more"
          className="mobile-tab mobile-tab-button"
          onClick={onOpenMore}
          aria-label="Open More Menu"
        >
          <div className="mobile-tab-icon-wrap">
            <Menu size={19} aria-hidden="true" />
          </div>
          <span className="mobile-tab-label">More</span>
        </button>
      </div>
    </nav>
  );
}
