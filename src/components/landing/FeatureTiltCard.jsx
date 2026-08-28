import React, { useRef, useState } from 'react';

export default function FeatureTiltCard({
  icon,
  badge,
  title,
  subtitle,
  description,
  accentColor = 'var(--color-primary)',
  tag,
  onClick,
}) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = e => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -10;
    const rotY = ((x - cx) / cx) * 10;
    setRotate({ x: rotX, y: rotY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.12 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleMouseEnter = () => setIsHovered(true);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label={`${title} — ${description}`}
      style={{
        position: 'relative',
        background: 'var(--color-surface)',
        border: `1px solid ${isHovered ? accentColor + '40' : 'var(--color-border)'}`,
        borderRadius: 18,
        padding: '24px',
        cursor: onClick ? 'pointer' : 'default',
        transform: isHovered
          ? `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(4px)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)',
        transition: isHovered
          ? 'border-color 200ms ease, box-shadow 200ms ease'
          : 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isHovered
          ? `0 20px 48px rgba(0,0,0,0.2), 0 0 0 1px ${accentColor}22, 0 8px 16px ${accentColor}12`
          : 'var(--shadow-sm)',
        overflow: 'hidden',
        willChange: 'transform',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {/* Top metallic highlight line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Warm glare sheen — champagne-toned */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(212,175,122,${glare.opacity}) 0%, transparent 60%)`,
        pointerEvents: 'none',
        transition: 'opacity 100ms ease',
      }} />

      {/* Accent corner glow */}
      {isHovered && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 80, height: 80,
          background: `radial-gradient(circle at top right, ${accentColor}15, transparent 70%)`,
          pointerEvents: 'none',
          borderRadius: '0 18px 0 0',
        }} />
      )}

      {/* Icon + Badge row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accentColor,
          transition: 'all 200ms ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: isHovered ? `0 4px 16px ${accentColor}25` : 'none',
        }}>
          {icon}
        </div>

        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            color: accentColor,
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}22`,
            padding: '3px 9px', borderRadius: 4,
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)',
        letterSpacing: '-0.02em', marginBottom: 4, lineHeight: 1.3,
      }}>
        {title}
      </h3>

      {subtitle && (
        <div style={{ fontSize: 11, fontWeight: 600, color: accentColor, marginBottom: 10, opacity: 0.85, letterSpacing: '0.02em' }}>
          {subtitle}
        </div>
      )}

      <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.65, marginBottom: 18 }}>
        {description}
      </p>

      {/* Footer tag */}
      {tag && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)', paddingTop: 12,
          width: '100%',
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: accentColor, display: 'inline-block', flexShrink: 0,
          }} />
          {tag}
          {onClick && (
            <span style={{ marginLeft: 'auto', color: accentColor, opacity: isHovered ? 1 : 0, transition: 'opacity 200ms ease', fontSize: 12 }}>
              →
            </span>
          )}
        </div>
      )}
    </div>
  );
}
