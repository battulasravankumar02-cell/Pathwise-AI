import React, { useRef, useEffect } from 'react';

export default function Hero3DCanvas({ className = '', style = {} }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── SIGNATURE PALETTE ── */
    const TEAL      = '#0d9488';
    const CHAMPAGNE = '#d4af7a';
    const COPPER    = '#c2692a';
    const EMERALD   = '#16a34a';
    const IVORY     = '#f0ede8';
    const ASH       = '#665f58';
    const GRAPHITE  = '#2a2a2e';

    /* ── NODES: Career Forge ── */
    const nodes = [
      {
        name: 'core', label: 'PATHWISE AI',
        x: 0, y: 0, z: 0, radius: 26,
        color: TEAL, glow: CHAMPAGNE, isCenter: true,
      },
      { name: 'roadmap',   label: 'ROADMAP',     x: -145, y: -55, z:  40, radius: 16, color: TEAL,      icon: '🗺️' },
      { name: 'targets',   label: 'TARGETS',     x:  135, y: -65, z: -30, radius: 15, color: EMERALD,   icon: '🎯' },
      { name: 'quiz',      label: 'DIAGNOSTICS', x:  145, y:  65, z:  50, radius: 16, color: COPPER,    icon: '🧠' },
      { name: 'vault',     label: 'VAULT',       x: -120, y:  80, z: -40, radius: 14, color: CHAMPAGNE, icon: '📚' },
      { name: 'analytics', label: 'ANALYTICS',   x:    0, y: -130, z:  20, radius: 14, color: CHAMPAGNE, icon: '📊' },
      { name: 'career',    label: 'CAREER READY', x:   0, y:  130, z: -10, radius: 18, color: COPPER,   icon: '🚀', isTarget: true },
    ];

    /* ── DEPTH PARTICLES (sparse, warm-toned) ── */
    const particles = Array.from({ length: 36 }, () => ({
      x: (Math.random() - 0.5) * 500,
      y: (Math.random() - 0.5) * 450,
      z: (Math.random() - 0.5) * 300,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    let angleY = 0;
    const fov = 380;
    const baseAngleX = 0.18;

    const render = () => {
      /* smooth mouse parallax */
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      /* Slow, sophisticated rotation */
      angleY += 0.0025 + mouseRef.current.x * 0.00015;
      const currentAngleX = baseAngleX + mouseRef.current.y * 0.00025;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      /* Orbital guide rings — very subtle graphite */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = `rgba(42, 42, 46, 0.6)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 8]);
      [{ rx: 165, ry: 82 }, { rx: 205, ry: 102 }].forEach(({ rx, ry }) => {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, currentAngleX * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();

      /* Depth particles */
      particles.forEach(p => {
        const cosY = Math.cos(angleY * 0.55);
        const sinY = Math.sin(angleY * 0.55);
        const rotX = p.x * cosY - p.z * sinY;
        const rotZ = p.x * sinY + p.z * cosY;
        const scale = fov / (fov + rotZ + 200);
        if (scale > 0) {
          const px = cx + rotX * scale;
          const py = cy + p.y * scale;
          ctx.fillStyle = `rgba(212, 175, 122, ${p.alpha * scale})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      /* Project all nodes */
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      const projected = nodes.map(node => {
        const x1 = node.x * cosY - node.z * sinY;
        const z1 = node.x * sinY + node.z * cosY;
        const y2 = node.y * cosX - z1 * sinX;
        const z2 = node.y * sinX + z1 * cosX;
        const scale = fov / (fov + z2 + 220);
        return { ...node, px: cx + x1 * scale, py: cy + y2 * scale, scale, z2 };
      });

      projected.sort((a, b) => b.z2 - a.z2);
      const core = projected.find(n => n.isCenter);

      /* Connection lines — copper/teal/champagne gradient */
      if (core) {
        projected.forEach(node => {
          if (node.isCenter) return;

          ctx.save();
          const grad = ctx.createLinearGradient(core.px, core.py, node.px, node.py);
          grad.addColorStop(0, `rgba(13,148,136,0.35)`);
          grad.addColorStop(1, `${node.color}44`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.8, 1.5 * node.scale);
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(core.px, core.py);
          ctx.lineTo(node.px, node.py);
          ctx.stroke();

          /* Energy pulse along link */
          const t = (Date.now() * 0.0012 + (node.x > 0 ? 0.5 : 0)) % 1;
          const epx = core.px + (node.px - core.px) * t;
          const epy = core.py + (node.py - core.py) * t;
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(epx, epy, 2 * node.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      /* Draw nodes */
      projected.forEach(node => {
        const r = node.radius * node.scale;
        ctx.save();

        if (node.isCenter) {
          /* Ambient halo — teal */
          const halo = ctx.createRadialGradient(node.px, node.py, r * 0.2, node.px, node.py, r * 3);
          halo.addColorStop(0, 'rgba(13,148,136,0.35)');
          halo.addColorStop(0.5, 'rgba(13,148,136,0.1)');
          halo.addColorStop(1, 'rgba(13,148,136,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(node.px, node.py, r * 3, 0, Math.PI * 2);
          ctx.fill();

          /* Secondary champagne halo */
          const halo2 = ctx.createRadialGradient(node.px, node.py, r, node.px, node.py, r * 2.2);
          halo2.addColorStop(0, 'rgba(212,175,122,0.15)');
          halo2.addColorStop(1, 'rgba(212,175,122,0)');
          ctx.fillStyle = halo2;
          ctx.beginPath();
          ctx.arc(node.px, node.py, r * 2.2, 0, Math.PI * 2);
          ctx.fill();

          /* Core nucleus — metallic teal-to-champagne */
          const nucleus = ctx.createRadialGradient(node.px - r * 0.3, node.py - r * 0.35, 2, node.px, node.py, r);
          nucleus.addColorStop(0, IVORY);
          nucleus.addColorStop(0.25, CHAMPAGNE);
          nucleus.addColorStop(0.6, TEAL);
          nucleus.addColorStop(1, '#0f5e59');
          ctx.fillStyle = nucleus;
          ctx.beginPath();
          ctx.arc(node.px, node.py, r, 0, Math.PI * 2);
          ctx.fill();

          /* Metallic rim */
          ctx.strokeStyle = `rgba(212,175,122,0.7)`;
          ctx.lineWidth = 1.5 * node.scale;
          ctx.stroke();

          /* Core label */
          ctx.font = `800 ${Math.max(9, 10.5 * node.scale)}px Inter, sans-serif`;
          ctx.fillStyle = IVORY;
          ctx.textAlign = 'center';
          ctx.fillText('PATHWISE AI', node.px, node.py + r + 15 * node.scale);

        } else {
          /* Orbit node */
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10 * node.scale;

          const grad = ctx.createRadialGradient(node.px - r * 0.28, node.py - r * 0.28, 1, node.px, node.py, r);
          grad.addColorStop(0, IVORY);
          grad.addColorStop(0.35, node.color);
          grad.addColorStop(1, '#0a0a0b');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.px, node.py, r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(240,237,232,0.3)`;
          ctx.lineWidth = 1.2 * node.scale;
          ctx.stroke();

          ctx.shadowBlur = 0;

          /* Node label */
          ctx.font = `700 ${Math.max(8, 9.5 * node.scale)}px Inter, sans-serif`;
          ctx.fillStyle = node.isTarget ? COPPER : ASH;
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.px, node.py + r + 13 * node.scale);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left - rect.width / 2;
      mouseRef.current.targetY = e.clientY - rect.top  - rect.height / 2;
    };
    const onLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      canvas?.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 440, ...style }} className={className}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
        aria-label="Interactive 3D Career Forge Visualizer"
      />
    </div>
  );
}
