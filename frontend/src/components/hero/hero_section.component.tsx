import { Link } from "react-router-dom";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register the GSAP plugin
gsap.registerPlugin(useGSAP);

const features = [
  {
    title: "Infinite Variations",
    description: "Generate multiple unique branches of your story from a single starting prompt. Explore every creative possibility.",
    bgClass: "bg-gradient-to-br from-blue-900 to-sky-600/70 dark:from-blue-950 dark:to-sky-800/90",
    icon: (
      <svg className="w-7 h-7 text-sky-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )
  },
  {
    title: "AI Co-Writer",
    description: "Stuck on a paragraph? Let our advanced AI models suggest the next perfect sentence to keep your momentum going.",
    bgClass: "bg-gradient-to-br from-indigo-900 to-purple-600/70 dark:from-indigo-950 dark:to-purple-800/90",
    icon: (
      <svg className="w-7 h-7 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  {
    title: "Community Driven",
    description: "Publish your stories, gather likes, and interact with other creators in a thriving, collaborative ecosystem.",
    bgClass: "bg-gradient-to-br from-fuchsia-900 to-pink-600/70 dark:from-fuchsia-950 dark:to-pink-800/90",
    icon: (
      <svg className="w-7 h-7 text-pink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
];

const FeatureCard = ({ feature }: { feature: any }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Parallax effect on inner content
      gsap.to(contentRef.current, {
        x: x * 0.15,
        y: y * 0.15,
        ease: "power2.out",
        duration: 0.3
      });

      // Slight 3D tilt on the card itself
      gsap.to(card, {
        rotateY: (x / rect.width) * 15,
        rotateX: -(y / rect.height) * 15,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.3
      });
    };

    const handleMouseLeave = () => {
      gsap.to(contentRef.current, {
        x: 0,
        y: 0,
        ease: "power2.out",
        duration: 0.7
      });

      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        ease: "power2.out",
        duration: 0.7
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: cardRef });

  return (
    <div style={{ perspective: "1000px" }} className="h-full">
      <div
        ref={cardRef}
        className={`motion-card relative overflow-hidden backdrop-blur-xl border border-white/10 rounded-3xl p-8 transition-shadow duration-500 shadow-xl group cursor-pointer ${feature.bgClass} hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] h-full`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div ref={contentRef} className="relative z-10 pointer-events-none">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-white/10 shadow-lg group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">{feature.title}</h3>
          <p className="text-white/80 leading-relaxed group-hover:text-white transition-colors duration-300">{feature.description}</p>
        </div>
      </div>
    </div>
  );
};

const HeroSectionComponent = () => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const nextStarId = useRef(1);
  const starTimers = useRef<number[]>([]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = nextStarId.current++;
    const size = 8 + Math.floor(Math.random() * 8);

    setStars((prev) => {
      const next = [...prev, { id, x, y, size }];
      return next.slice(-18);
    });

    const timerId = window.setTimeout(() => {
      setStars((prev) => prev.filter((star) => star.id !== id));
      starTimers.current = starTimers.current.filter((timer) => timer !== timerId);
    }, 650);
    starTimers.current.push(timerId);
  };

  useEffect(() => {
    return () => {
      starTimers.current.forEach((timerId) => window.clearTimeout(timerId));
      starTimers.current = [];
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-200/55 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-300" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-200/45 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 transition-colors duration-300" />

      <div className="relative overflow-hidden" onMouseMove={handleMouseMove}>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 text-center">
          <div className="motion-card-subtle inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 backdrop-blur-md mb-8 shadow-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:border-blue-400/30 transition-all duration-300">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">StorySparkAI v2.0 is live</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Ignite Your Imagination With <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm pb-2">
              AI-Driven Storytelling
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10 transition-colors duration-300">
            Create, edit, and generate engaging multiple story variations from a single prompt.
            Perfect for writers, creators, and enthusiasts exploring the future of fiction.
          </p>
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="relative max-w-3xl w-full before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-r before:from-purple-500/20 before:via-indigo-500/20 before:to-blue-500/20 before:blur-xl before:animate-pulse">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-sparkles text-gray-400"></i>
                </div>
                <Link to="/stories">
                  <button className="relative !rounded-button bg-gradient-to-ber from-blue-900 via-emerald-800 to-blue-500 text-white font-medium px-6 py-2 mr-2 border border-white/20 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:via-blue-900 before:to-emerald-800 before:animate-border-gradient before:rounded-xl before:-z-10 before:blur-sm cursor-pointer">
                    <i className="fa fa-wand-magic-sparkles mr-2"></i>Get
                    Started
                  </button>
                </Link>
                <Link to="/collab">
                  <button className="relative !rounded-button bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium px-6 py-2 border border-white/20 transition-all duration-300 rounded-xl cursor-pointer">
                    ✍️ Collab Mode
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="hero-cursor-stars absolute inset-0" aria-hidden="true">
            {stars.map((star) => (
              <span
                key={star.id}
                className={`hero-cursor-star ${star.size > 12 ? "hero-cursor-star-large" : ""}`}
                style={{ left: star.x, top: star.y, width: star.size, height: star.size }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard feature={feature} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSectionComponent;
