import React, { useEffect, useRef } from 'react';
import { ArrowRight, Shield } from 'lucide-react';

export default function IntroExperience({ onEnter }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return undefined;

    const ctx = canvas.getContext('2d');
    let frame;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const scale = window.devicePixelRatio || 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: Math.min(Math.floor((width * height) / 34000), 42) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.1 + 0.45,
      p: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 125) {
            ctx.strokeStyle = `rgba(125, 211, 252, ${(1 - d / 125) * 0.055})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        particle.x = (particle.x + particle.vx + width) % width;
        particle.y = (particle.y + particle.vy + height) % height;
        const alpha = 0.25 + 0.28 * Math.sin(t + particle.p);
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#070809]">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(125,211,252,0.10),transparent_28rem)]" />

      <main className="relative z-10 mx-5 flex max-w-3xl flex-col items-center text-center">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.045] text-sky-100">
          <Shield className="h-6 w-6" />
        </div>
        <div className="section-kicker">Quantum Security Operations Center</div>
        <h1 className="mt-5 text-6xl font-semibold tracking-normal text-zinc-50 md:text-8xl">QSOC</h1>
        <p className="mt-5 text-xl font-medium tracking-normal text-zinc-200 md:text-2xl">Quantum Security Operations Center</p>
        <p className="mt-4 max-w-xl text-base leading-7 text-zinc-500">
          Quantum digital-signature verification, threat detection & incident intelligence
        </p>
        <button onClick={onEnter} className="btn-primary mt-10 min-h-12 px-6 text-sm">
          Enter QSOC
          <ArrowRight className="h-4 w-4" />
        </button>
      </main>
    </div>
  );
}
