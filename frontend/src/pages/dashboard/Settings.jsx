import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlusIcon, XMarkIcon, UserIcon, AcademicCapIcon, LockClosedIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { usersApi, uploadApi, authApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import { apiError, CATEGORY_ICONS } from '../../utils/helpers';

const TIMEZONES = ['UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'];
const CATEGORIES = Object.keys(CATEGORY_ICONS);

const TABS = [
  { key: 'profile', label: 'Profile', icon: UserIcon },
  { key: 'skills', label: 'Skills', icon: AcademicCapIcon },
  { key: 'security', label: 'Security', icon: LockClosedIcon },
  { key: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
];

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [tab, setTab] = useState('profile');
  const [skillsToTeach, setSkillsToTeach] = useState(user?.skillsToTeach || []);
  const [skillsToLearn, setSkillsToLearn] = useState(user?.skillsToLearn || []);
  const [newTeach, setNewTeach] = useState({ name: '', category: 'Programming', level: 'intermediate' });
  const [newLearn, setNewLearn] = useState({ name: '', category: 'Programming', priority: 'medium' });
  const [avatarLoading, setAvatarLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      headline: user?.profile?.headline || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      timezone: user?.profile?.timezone || 'UTC',
      website: user?.profile?.website || '',
      linkedin: user?.profile?.linkedin || '',
      github: user?.profile?.github || '',
      languages: user?.profile?.languages?.join(', ') || '',
    },
  });

  const { register: pwRegister, handleSubmit: pwSubmit, reset: pwReset, watch: pwWatch, formState: { errors: pwErrors } } = useForm();

  const onSaveProfile = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await usersApi.updateProfile({
        name: data.name,
        profile: {
          headline: data.headline,
          bio: data.bio,
          location: data.location,
          timezone: data.timezone,
          website: data.website,
          linkedin: data.linkedin,
          github: data.github,
          languages: data.languages ? data.languages.split(',').map((l) => l.trim()).filter(Boolean) : [],
        },
        skillsToTeach,
        skillsToLearn,
      });
      updateUser(res.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (data) => {
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      pwReset();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setPwLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const { data } = await uploadApi.uploadAvatar(file);
      const { data: updated } = await usersApi.updateProfile({ avatar: data.url });
      updateUser(updated.user);
      toast.success('Avatar updated!');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setAvatarLoading(false);
    }
  };

  const addTeachSkill = () => {
    if (!newTeach.name.trim()) return;
    setSkillsToTeach((p) => [...p, { ...newTeach }]);
    setNewTeach({ name: '', category: 'Programming', level: 'intermediate' });
  };

  const addLearnSkill = () => {
    if (!newLearn.name.trim()) return;
    setSkillsToLearn((p) => [...p, { ...newLearn }]);
    setNewLearn({ name: '', category: 'Programming', priority: 'medium' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-6">
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your profile, skills, and preferences.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5">
              <div className="card flex items-center gap-5">
                <Avatar user={user} size="xl" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">Profile Photo</p>
                  <label className="btn-secondary text-sm cursor-pointer">
                    {avatarLoading ? 'Uploading…' : 'Change photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarLoading} />
                  </label>
                  <p className="text-xs text-gray-400 mt-1.5">JPG or PNG, max 5 MB</p>
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Basic Info</h3>
                <Input label="Full name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />
                <Input label="Professional headline" placeholder="e.g. Senior Developer & Guitar Enthusiast" {...register('headline')} />
                <div>
                  <label className="label">Bio</label>
                  <textarea className="input resize-none" rows={4} placeholder="Tell others about yourself…" {...register('bio')} />
                </div>
              </div>

              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Location & Language</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Location" placeholder="City, Country" {...register('location')} />
                  <div>
                    <label className="label">Timezone</label>
                    <select className="input" {...register('timezone')}>
                      {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
                <Input label="Languages (comma-separated)" placeholder="English, Spanish, French" {...register('languages')} />
              </div>

              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Social Links</h3>
                <Input label="Website" placeholder="https://yoursite.com" {...register('website')} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="LinkedIn" placeholder="linkedin.com/in/…" {...register('linkedin')} />
                  <Input label="GitHub" placeholder="github.com/username" {...register('github')} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-gradient w-full py-3 rounded-xl text-base">
                {loading ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          )}

          {/* ── Skills tab ── */}
          {tab === 'skills' && (
            <div className="space-y-5">
              {/* Teaching */}
              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Skills I Can Teach</h3>
                <div className="flex flex-wrap gap-2 min-h-10">
                  {skillsToTeach.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No teaching skills added yet</p>
                  )}
                  {skillsToTeach.map((skill, i) => (
                    <span key={i} className="skill-chip">
                      {CATEGORY_ICONS[skill.category]} {skill.name}
                      <span className="opacity-60">· {skill.level}</span>
                      <button type="button" onClick={() => setSkillsToTeach((p) => p.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="input col-span-1 text-sm"
                    placeholder="Skill name"
                    value={newTeach.name}
                    onChange={(e) => setNewTeach((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTeachSkill())}
                  />
                  <select className="input text-sm" value={newTeach.category} onChange={(e) => setNewTeach((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <select className="input text-sm" value={newTeach.level} onChange={(e) => setNewTeach((p) => ({ ...p, level: e.target.value }))}>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <button type="button" onClick={addTeachSkill} className="btn-secondary text-sm flex items-center gap-1.5">
                  <PlusIcon className="w-4 h-4" /> Add Teaching Skill
                </button>
              </div>

              {/* Learning */}
              <div className="card space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Skills I Want to Learn</h3>
                <div className="flex flex-wrap gap-2 min-h-10">
                  {skillsToLearn.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No learning goals added yet</p>
                  )}
                  {skillsToLearn.map((skill, i) => (
                    <span key={i} className="skill-chip-learn">
                      {CATEGORY_ICONS[skill.category]} {skill.name}
                      <button type="button" onClick={() => setSkillsToLearn((p) => p.filter((_, j) => j !== i))} className="hover:text-red-500 transition-colors">
                        <XMarkIcon className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="input text-sm"
                    placeholder="Skill name"
                    value={newLearn.name}
                    onChange={(e) => setNewLearn((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLearnSkill())}
                  />
                  <select className="input text-sm" value={newLearn.category} onChange={(e) => setNewLearn((p) => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <button type="button" onClick={addLearnSkill} className="btn-secondary text-sm flex items-center gap-1.5">
                  <PlusIcon className="w-4 h-4" /> Add Learning Goal
                </button>
              </div>

              <button
                type="button"
                onClick={handleSubmit(onSaveProfile)}
                disabled={loading}
                className="btn-gradient w-full py-3 rounded-xl text-base"
              >
                {loading ? 'Saving…' : 'Save Skills'}
              </button>
            </div>
          )}

          {/* ── Security tab ── */}
          {tab === 'security' && (
            <form onSubmit={pwSubmit(onChangePassword)} className="card space-y-5">
              <h3 className="font-semibold text-gray-900 dark:text-white">Change Password</h3>
              <Input
                label="Current password"
                type="password"
                error={pwErrors.currentPassword?.message}
                {...pwRegister('currentPassword', { required: 'Current password is required' })}
              />
              <Input
                label="New password"
                type="password"
                error={pwErrors.newPassword?.message}
                {...pwRegister('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'At least 8 characters' } })}
              />
              <Input
                label="Confirm new password"
                type="password"
                error={pwErrors.confirmPassword?.message}
                {...pwRegister('confirmPassword', { validate: (v) => v === pwWatch('newPassword') || 'Passwords do not match' })}
              />
              <button type="submit" disabled={pwLoading} className="btn-gradient w-full py-3 rounded-xl">
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          )}

          {/* ── Appearance tab ── */}
          {tab === 'appearance' && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-13 h-7 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-brand-500' : 'bg-gray-300'}`}
                  style={{ width: '52px', height: '28px' }}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {user?.referralCode && (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Referral Code</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share to earn rewards</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1.5 rounded-xl border border-brand-200 dark:border-brand-900">
                      {user.referralCode}
                    </span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(user.referralCode); toast.success('Copied!'); }}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
