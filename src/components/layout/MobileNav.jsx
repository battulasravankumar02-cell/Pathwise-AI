import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Target, Menu } from 'lucide-react';

export default function MobileNav({ onOpenMore }) {
  return (
    <nav className="mobile-nav" role="navigation" aria-label="Mobile primary navigation">
      <div className="mobile-nav-bar">
        
        {/* 1. HOME */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
          aria-label="Home Dashboard"
        >
          <div className="mobile-tab-icon-wrap">
            <Home size={20} aria-hidden="true" />
          </div>
          <span className="mobile-tab-label">Home</span>
        </NavLink>

        {/* 2. LEARN */}
        <NavLink
          to="/learn"
          className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
          aria-label="Learning Hub"
        >
          <div className="mobile-tab-icon-wrap">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <span className="mobile-tab-label">Learn</span>
        </NavLink>

        {/* 3. ROADMAP */}
        <NavLink
          to="/roadmap"
          className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
          aria-label="FutureForge Roadmap"
        >
          <div className="mobile-tab-icon-wrap">
            <Sparkles size={20} aria-hidden="true" />
          </div>
          <span className="mobile-tab-label">Roadmap</span>
        </NavLink>

        {/* 4. CAREER */}
        <NavLink
          to="/goal-career"
          className={({ isActive }) => `mobile-tab ${isActive ? 'active' : ''}`}
          aria-label="Career Discover"
        >
          <div className="mobile-tab-icon-wrap">
            <Target size={20} aria-hidden="true" />
          </div>
          <span className="mobile-tab-label">Career</span>
        </NavLink>

        {/* 5. MORE */}
        <button
          type="button"
          className="mobile-tab mobile-tab-button"
          onClick={onOpenMore}
          aria-label="Open More Menu"
        >
          <div className="mobile-tab-icon-wrap">
            <Menu size={20} aria-hidden="true" />
          </div>
          <span className="mobile-tab-label">More</span>
        </button>

      </div>
    </nav>
  );
}
