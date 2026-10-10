import { useEffect, useRef } from 'react';

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId = 0;
    let columns = 0;
    let drops: number[] = [];
    const fontSize = 14;
    const chars = '0123456789₹%∆∇∞≈πΣΩ';

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(0, 0, 0, 0, 0, 0);
      ctx.scale(dpr, dpr);
      columns = Math.floor(w / fontSize);
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    }

    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;
    const frameInterval = 1000 / 24;

    function draw(time: number) {
      if (!ctx || !canvas) return;

      if (time - lastTime < frameInterval) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;

      const isDark = document.documentElement.classList.contains('dark');
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      ctx.fillStyle = isDark ? 'rgba(12, 12, 12, 0.06)' : 'rgba(250, 249, 247, 0.06)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px 'Work Sans', monospace`;

      const charColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.022)';
      const headColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)';

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.975 ? headColor : charColor;
        ctx.fillText(char, i * fontSize, y);

        if (y > h && Math.random() > 0.97) {
          drops[i] = Math.random() * -20;
        }
        drops[i] += 0.1;
      }

      animationId = requestAnimationFrame(draw);
    }

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] text-base-color" />
      <div className="absolute inset-0 bg-vignette" />
    </div>
  );
}
