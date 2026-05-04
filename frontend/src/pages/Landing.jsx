import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon, SparklesIcon, ChatBubbleLeftRightIcon,
  CalendarIcon, StarIcon, SunIcon, MoonIcon,
  ShieldCheckIcon, BoltIcon, GlobeAltIcon, UsersIcon,
  CheckIcon, ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import useUIStore from '../store/uiStore';

/* ── Animated counter ─────────────────────────── */
function Counter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const duration = 1800;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(target);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ── Floating orb ─────────────────────────────── */
function Orb({ className }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none ${className}`} />;
}

/* ── Feature card ─────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, gradient, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card-feature group"
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-[15px]">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

/* ── Testimonial card ─────────────────────────── */
const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Learned Python in 3 weeks', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya', text: 'I taught Hindi to a developer and learned React in return. SkillSwap made it incredibly easy and fun!', rating: 5 },
  { name: 'James M.', role: 'Swapped Guitar for Data Science', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james', text: 'Found my perfect swap partner within 24 hours. The matching algorithm is uncannily accurate.', rating: 5 },
  { name: 'Lena K.', role: 'Exchanged Design for Marketing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lena', text: 'The platform feels premium. Real connections, real learning — no money changes hands. Brilliant concept.', rating: 5 },
];

/* ── Popular skills ticker ────────────────────── */
const SKILLS = ['JavaScript','Python','UI/UX Design','Guitar','Spanish','Photography','Data Science','React','Piano','Yoga','French','Figma','Machine Learning','Drawing','Copywriting'];

function SkillsTicker() {
  return (
    <div className="relative overflow-hidden py-3 mask-fade-x">
      <motion.div
        className="flex gap-3 w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
      >
        {[...SKILLS, ...SKILLS].map((s, i) => (
          <span key={i} className="skill-chip whitespace-nowrap text-xs px-3 py-1.5 cursor-default select-none">✨ {s}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Swap demo mockup ─────────────────────────── */
function SwapDemo() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card A */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="card p-4 mb-3 flex items-center gap-3"
      >
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex2" className="w-10 h-10 rounded-full" alt="" />
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Alex Chen</p>
          <p className="text-xs text-muted">Offers: <span className="text-brand-600 font-medium">JavaScript</span></p>
        </div>
        <span className="skill-chip text-xs">Expert</span>
      </motion.div>

      {/* Arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
        className="flex justify-center my-1"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow">
          <ArrowRightIcon className="w-4 h-4 text-white rotate-90" />
        </div>
      </motion.div>

      {/* Card B */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="card p-4 mt-3 flex items-center gap-3"
      >
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=sofia2" className="w-10 h-10 rounded-full" alt="" />
        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">Sofia M.</p>
          <p className="text-xs text-muted">Offers: <span className="text-accent-600 font-medium">Guitar</span></p>
        </div>
        <span className="skill-chip-learn text-xs">Intermediate</span>
      </motion.div>

      {/* Match badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="absolute -right-4 top-1/2 -translate-y-1/2 bg-gradient-to-br from-brand-500 to-accent-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-glow"
      >
        94% match ✨
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const { theme, toggleTheme } = useUIStore();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const features = [
    { icon: SparklesIcon, title: 'Smart Matching Algorithm', desc: 'Our AI finds your ideal swap partners using 12+ compatibility signals — skills, availability, location, timezone, and trust score.', gradient: 'from-brand-500 to-brand-700', delay: 0 },
    { icon: ChatBubbleLeftRightIcon, title: 'Real-time Messaging', desc: 'Built-in encrypted chat with typing indicators, read receipts, and file sharing. No third-party apps needed.', gradient: 'from-accent-500 to-accent-700', delay: 0.1 },
    { icon: CalendarIcon, title: 'Session Scheduling', desc: 'Timezone-aware booking with video, audio, or in-person formats. Automated reminders ensure no-shows are history.', gradient: 'from-emerald-500 to-teal-600', delay: 0.2 },
    { icon: ShieldCheckIcon, title: 'Verified Reviews', desc: 'Multi-dimensional ratings build real trust. Only swap partners who completed sessions can leave reviews.', gradient: 'from-amber-500 to-orange-600', delay: 0.3 },
    { icon: BoltIcon, title: 'Reputation & Badges', desc: 'Earn badges, build your reputation score, and climb the community leaderboard as you swap more skills.', gradient: 'from-pink-500 to-rose-600', delay: 0.4 },
    { icon: GlobeAltIcon, title: 'Global Community', desc: 'Connect with learners across 60+ countries. Language filters and timezone matching make global swaps seamless.', gradient: 'from-sky-500 to-blue-600', delay: 0.5 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 overflow-x-hidden">

      {/* ── Navbar ────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300">
        <div className="glass-strong border-b border-gray-100/60 dark:border-gray-800/40">
          <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="font-bold text-[17px] text-gradient">SkillSwap Quest</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
              <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
              <a href="#how" className="hover:text-brand-600 transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-brand-600 transition-colors">Stories</a>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {theme === 'dark'
                  ? <SunIcon className="w-4 h-4" />
                  : <MoonIcon className="w-4 h-4" />}
              </button>
              <Link to="/auth/login" className="hidden sm:block btn-ghost text-sm px-4">Sign in</Link>
              <Link to="/auth/signup" className="btn-gradient text-sm px-5 py-2.5 rounded-xl">
                Get Started <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────── */}
      <section className="relative pt-32 pb-24 px-5 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-grid opacity-60 dark:opacity-30" />
        <Orb className="w-[600px] h-[600px] bg-brand-400 top-[-10%] left-[-10%]" />
        <Orb className="w-[500px] h-[500px] bg-accent-400 top-[5%] right-[-5%]" />
        <Orb className="w-[400px] h-[400px] bg-sky-400 bottom-0 left-[30%]" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-sm font-semibold border border-brand-200/60 dark:border-brand-700/40 mb-6">
                  <SparklesIcon className="w-4 h-4" />
                  1,200+ skill swaps completed this week
                </div>

                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
                  Teach what you know.{' '}
                  <span className="text-gradient">Learn what you want.</span>
                </h1>

                <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-xl">
                  SkillSwap Quest is the peer-to-peer skill exchange platform where knowledge is the currency.
                  No money. Just pure value exchange.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-12">
                  <Link to="/auth/signup" className="btn-gradient text-base px-7 py-3.5 rounded-xl">
                    Start Swapping Free
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <Link to="/discover" className="btn-secondary text-base px-7 py-3.5">
                    Browse Skills
                  </Link>
                </div>

                {/* Trust bar */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {['alex2','sofia2','marcus','yuki'].map(s => (
                      <img key={s} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`}
                        className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-900" alt="" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">12,000+</span> learners already swapping
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: live demo mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-950/30 dark:to-accent-950/30 rounded-3xl blur-2xl" />
              <div className="relative p-8">
                <SwapDemo />
                {/* Floating badges */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 left-0 card p-3 flex items-center gap-2 text-xs shadow-card-xl">
                  <span>🏅</span> <span className="font-semibold">Badge earned: First Swap!</span>
                </motion.div>
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-4 right-0 card p-3 text-xs shadow-card-xl">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">⭐⭐⭐⭐⭐</div>
                  <p className="font-semibold text-gray-900 dark:text-white">"Amazing session!"</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Skills ticker ──────────────────── */}
      <div className="border-y border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-900/30 py-1">
        <SkillsTicker />
      </div>

      {/* ── Stats ─────────────────────────── */}
      <section className="py-20 px-5 bg-white dark:bg-surface-950">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 12000, suffix: '+', label: 'Active Learners', icon: '👥' },
            { value: 500, suffix: '+', label: 'Skills Listed', icon: '🎯' },
            { value: 8200, suffix: '+', label: 'Swaps Completed', icon: '🔄' },
            { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: '⭐' },
          ].map(({ value, suffix, label, icon }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-3xl font-black text-gradient mb-1">
                <Counter target={value} suffix={suffix} />
              </div>
              <div className="text-sm text-muted font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────── */}
      <section id="features" className="py-24 px-5 bg-surface-50 dark:bg-gray-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wide border border-brand-200/60 dark:border-brand-700/40 mb-4">
                Everything you need
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                Built for real skill exchange
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-lg">
                Every feature is designed to make knowledge exchange seamless, trustworthy, and enjoyable.
              </p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────── */}
      <section id="how" className="py-24 px-5 bg-white dark:bg-surface-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                From sign-up to first swap in minutes
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Three steps. Zero friction.</p>
            </motion.div>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-brand-300 via-accent-300 to-emerald-300 hidden md:block" />
            <div className="space-y-8">
              {[
                { n: '1', title: 'Build your profile', desc: 'List your teachable skills, learning goals, availability, and timezone. Our wizard makes it a 2-minute setup.', icon: '👤', color: 'from-brand-500 to-brand-700' },
                { n: '2', title: 'Get smart-matched', desc: 'Our algorithm shows you the most compatible swap partners with a percentage match score and exactly why you match.', icon: '✨', color: 'from-accent-500 to-accent-700' },
                { n: '3', title: 'Start swapping', desc: 'Send a swap request, chat, schedule a session, and start exchanging knowledge. Rate each other after to build trust.', icon: '🚀', color: 'from-emerald-500 to-teal-600' },
              ].map(({ n, title, desc, icon, color }, i) => (
                <motion.div key={n} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex flex-col items-center justify-center shrink-0 shadow-lg text-white`}>
                    <span className="text-2xl">{icon}</span>
                    <span className="text-xs font-bold mt-0.5">Step {n}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────── */}
      <section id="testimonials" className="py-24 px-5 bg-surface-50 dark:bg-gray-900/40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12 tracking-tight">
              Real swaps. Real stories.
            </h2>
          </motion.div>
          <div className="relative min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="card p-8 text-left"
              >
                <div className="flex text-yellow-400 mb-5 gap-0.5">
                  {Array(5).fill(0).map((_, i) => <StarIcon key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={TESTIMONIALS[activeTestimonial].avatar} className="w-11 h-11 rounded-full ring-2 ring-brand-200" alt="" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{TESTIMONIALS[activeTestimonial].name}</p>
                    <p className="text-sm text-muted">{TESTIMONIALS[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'bg-brand-500 w-6' : 'bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────── */}
      <section className="py-24 px-5 bg-white dark:bg-surface-950">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-4xl p-12 text-center text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #d946ef 100%)' }}
          >
            <div className="absolute inset-0 bg-dots opacity-20" />
            <div className="relative">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to swap your first skill?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
                Join 12,000+ learners exchanging knowledge every day. It's free, it's fun, and it actually works.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth/signup"
                  className="bg-white text-brand-700 hover:bg-gray-50 font-bold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-xl inline-flex items-center gap-2">
                  Create free account
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link to="/auth/login"
                  className="bg-white/15 hover:bg-white/25 backdrop-blur border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all inline-flex items-center gap-2">
                  I have an account
                </Link>
              </div>
              <p className="text-white/60 text-xs mt-6">No credit card · No subscriptions · 100% free</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span className="font-bold text-gradient">SkillSwap Quest</span>
          </div>
          <p className="text-muted text-sm">© 2025 SkillSwap Quest · Built with ❤️ for lifelong learners</p>
          <div className="flex gap-5 text-sm text-muted">
            <a href="#" className="hover:text-brand-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
