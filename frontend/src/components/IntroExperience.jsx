import React, { useEffect, useRef } from 'react';
import { ArrowRight, Cpu, ShieldCheck } from 'lucide-react';

export default function IntroExperience({ onEnter }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Sparse, subtle quantum particle field
    const count = Math.min(Math.floor((width * height) / 28000), 45);
    const particles = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.2 + 0.6,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Faint entanglement links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.08;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = 0.4 + 0.3 * Math.sin(time + p.phase);
        ctx.fillStyle = `rgba(56, 189, 248, ${pulse})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#080A0D] flex items-center justify-center overflow-hidden">
      {/* Isolated Quantum Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-50" />

      {/* Main Content Box */}
      <div className="relative z-10 max-w-lg mx-4 text-center space-y-7 p-8 md:p-10 rounded-xl border border-[#1E2532] bg-[#0E1219] shadow-2xl">
        
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center p-3 bg-[#151B26] border border-[#273142] rounded-xl text-sky-400">
          <Cpu className="w-8 h-8" />
        </div>

        {/* Branding & Subtitle */}
        <div className="space-y-2.5">
          <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider text-slate-400 bg-[#141922] border border-[#222B3A]">
            AERSIMULATOR STATEVECTOR • EXACT BINOMIAL VERIFIER
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
            QSOC
          </h1>
          
          <p className="text-sm md:text-base font-semibold text-slate-200">
            Quantum Security Operations Center
          </p>

          <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto leading-relaxed pt-1">
            Quantum digital-signature verification, deterministic threat detection & incident intelligence
          </p>
        </div>

        {/* Specs Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-400 border-t border-[#1C2330]">
          <div className="p-2 rounded bg-[#0B0E14] border border-[#19202C]">
            <span className="text-[9px] text-slate-500 block uppercase">Protocol</span>
            <strong className="text-slate-200">3-Qubit QDS</strong>
          </div>
          <div className="p-2 rounded bg-[#0B0E14] border border-[#19202C]">
            <span className="text-[9px] text-slate-500 block uppercase">Threat Engine</span>
            <strong className="text-sky-400">Deterministic</strong>
          </div>
          <div className="p-2 rounded bg-[#0B0E14] border border-[#19202C]">
            <span className="text-[9px] text-slate-500 block uppercase">AI Analyst</span>
            <strong className="text-emerald-400">Groq LLM</strong>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-[#080A0D] font-bold text-xs tracking-wide transition-all shadow-md active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-[#080A0D]"
          >
            <span>ENTER QSOC</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
