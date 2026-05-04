import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import Input from '../components/ui/Input';
import useAuthStore from '../store/authStore';
import { usersApi } from '../services/api';
import { apiError, CATEGORY_ICONS } from '../utils/helpers';

const CATEGORIES = Object.keys(CATEGORY_ICONS);
const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STEPS = [
  { label: 'Profile', icon: '👤', desc: 'Tell us who you are' },
  { label: 'Teach', icon: '🎓', desc: 'Skills you can share' },
  { label: 'Learn', icon: '📚', desc: 'What you want to learn' },
  { label: 'Availability', icon: '📅', desc: 'When you can meet' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s.label} className="flex items-center">
          <motion.div
            animate={{
              scale: i === current ? 1.1 : 1,
              backgroundColor: i < current ? '#6366f1' : i === current ? '#ffffff' : 'transparent',
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
              i < current
                ? 'border-brand-500 bg-brand-500 text-white'
                : i === current
                  ? 'border-brand-500 bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-glow-sm'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'
            }`}
          >
            {i < current ? <CheckIcon className="w-5 h-5" /> : <span>{s.icon}</span>}
          </motion.div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 h-0.5 mx-1 transition-all duration-500 ${i < current ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);
  const [newTeachSkill, setNewTeachSkill] = useState({ name: '', category: 'Programming', level: 'intermediate' });
  const [newLearnSkill, setNewLearnSkill] = useState({ name: '', category: 'Programming', priority: 'medium' });
  const [availability, setAvailability] = useState([]);
  const { updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, getValues } = useForm();

  const toggleDay = (day) => setAvailability((p) => p.includes(day) ? p.filter((d) => d !== day) : [...p, day]);

  const addTeachSkill = () => {
    if (!newTeachSkill.name.trim()) return;
    setSkillsToTeach((p) => [...p, { ...newTeachSkill, tags: [] }]);
    setNewTeachSkill({ name: '', category: 'Programming', level: 'intermediate' });
  };

  const addLearnSkill = () => {
    if (!newLearnSkill.name.trim()) return;
    setSkillsToLearn((p) => [...p, { ...newLearnSkill }]);
    setNewLearnSkill({ name: '', category: 'Programming', priority: 'medium' });
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const vals = getValues();
      const { data: res } = await usersApi.completeOnboarding({
        profile: {
          bio: vals.bio,
          headline: vals.headline,
          location: vals.location,
          timezone: vals.timezone || 'UTC',
          languages: vals.languages ? vals.languages.split(',').map((l) => l.trim()).filter(Boolean) : [],
          experienceLevel: vals.experienceLevel || 'intermediate',
          availability: availability.map((day) => ({ day, slots: [{ start: '09:00', end: '17:00' }] })),
        },
        skillsToTeach,
        skillsToLearn,
      });
      updateUser(res.user);
      toast.success('Profile complete! Welcome to SkillSwap 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1 && skillsToTeach.length === 0) { toast.error('Add at least one skill to teach'); return false; }
    if (step === 2 && skillsToLearn.length === 0) { toast.error('Add at least one skill to learn'); return false; }
    return true;
  };

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-6">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="font-bold text-xl text-gradient">SkillSwap</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Let's set up your profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Step {step + 1} of {STEPS.length} — {currentStep.desc}
          </p>
        </div>

        <StepIndicator current={step} />

        {/* Card */}
        <div className="card shadow-card-xl">
          {/* Step heading */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 dark:from-brand-950/60 dark:to-accent-950/60 flex items-center justify-center text-2xl">
              {currentStep.icon}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">{currentStep.label}</h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">{currentStep.desc}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >

              {/* Step 0: Profile */}
              {step === 0 && (
                <div className="space-y-4">
                  <Input label="Professional headline" placeholder="e.g. Senior Developer & Guitar Enthusiast" {...register('headline')} />
                  <div>
                    <label className="label">Bio</label>
                    <textarea className="input resize-none" rows={3} placeholder="Tell others about yourself and what excites you about skill swapping…" {...register('bio')} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Location" placeholder="City, Country" {...register('location')} />
                    <div>
                      <label className="label">Timezone</label>
                      <select className="input" {...register('timezone')}>{TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Languages" placeholder="English, Spanish…" {...register('languages')} />
                    <div>
                      <label className="label">Experience level</label>
                      <select className="input" {...register('experienceLevel')}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Teach */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 min-h-10">
                    {skillsToTeach.length === 0 && <p className="text-sm text-gray-400 italic">No skills added yet</p>}
                    {skillsToTeach.map((skill, i) => (
                      <span key={i} className="skill-chip">
                        {CATEGORY_ICONS[skill.category] || '✨'} {skill.name}
                        <span className="opacity-60">({skill.level})</span>
                        <button onClick={() => setSkillsToTeach((p) => p.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                    <input
                      className="input text-sm"
                      placeholder="Skill name (e.g. JavaScript, Piano)"
                      value={newTeachSkill.name}
                      onChange={(e) => setNewTeachSkill((p) => ({ ...p, name: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeachSkill())}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select className="input text-sm" value={newTeachSkill.category} onChange={(e) => setNewTeachSkill((p) => ({ ...p, category: e.target.value }))}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select className="input text-sm" value={newTeachSkill.level} onChange={(e) => setNewTeachSkill((p) => ({ ...p, level: e.target.value }))}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <button type="button" onClick={addTeachSkill} className="btn-secondary w-full text-sm justify-center flex items-center gap-1.5">
                      <PlusIcon className="w-4 h-4" /> Add teaching skill
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Learn */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 min-h-10">
                    {skillsToLearn.length === 0 && <p className="text-sm text-gray-400 italic">No learning goals added yet</p>}
                    {skillsToLearn.map((skill, i) => (
                      <span key={i} className="skill-chip-learn">
                        {CATEGORY_ICONS[skill.category] || '✨'} {skill.name}
                        <button onClick={() => setSkillsToLearn((p) => p.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                          <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3 hover:border-accent-300 dark:hover:border-accent-700 transition-colors">
                    <input
                      className="input text-sm"
                      placeholder="Skill name (e.g. Guitar, Spanish)"
                      value={newLearnSkill.name}
                      onChange={(e) => setNewLearnSkill((p) => ({ ...p, name: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLearnSkill())}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select className="input text-sm" value={newLearnSkill.category} onChange={(e) => setNewLearnSkill((p) => ({ ...p, category: e.target.value }))}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <select className="input text-sm" value={newLearnSkill.priority} onChange={(e) => setNewLearnSkill((p) => ({ ...p, priority: e.target.value }))}>
                        <option value="low">Low priority</option>
                        <option value="medium">Medium priority</option>
                        <option value="high">High priority</option>
                      </select>
                    </div>
                    <button type="button" onClick={addLearnSkill} className="btn-secondary w-full text-sm justify-center flex items-center gap-1.5">
                      <PlusIcon className="w-4 h-4" /> Add learning goal
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Availability */}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Which days are you generally available for sessions?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          availability.includes(day)
                            ? 'bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/30 dark:to-accent-950/30 border border-brand-100 dark:border-brand-900/40">
                    <p className="text-sm font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-2">
                      🎉 Almost there!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Once you complete setup, our algorithm will start finding your perfect skill swap matches.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="btn-secondary disabled:opacity-40"
            >
              ← Back
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => { if (canNext()) setStep((s) => s + 1); }}
                className="btn-gradient px-6 py-2.5 rounded-xl"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="btn-gradient px-6 py-2.5 rounded-xl"
              >
                {loading ? 'Setting up…' : '🚀 Complete Setup'}
              </button>
            )}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-brand-500' : i < step ? 'w-3 bg-brand-300' : 'w-3 bg-gray-200 dark:bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
