import { useEffect, useMemo, useState, type ChangeEvent, type ComponentType, type FormEvent } from 'react'
import { Bell, CalendarDays, ChevronDown, ChevronRight, CircleHelp, Download, FolderOpen, Grid2X2, LayoutDashboard, LockKeyhole, LogOut, Menu, Plus, Search, Settings, ShieldCheck, Sparkles, Target, TrendingUp, Trophy, Upload, UserPlus, Users, X } from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import './App.css'

type Icon = ComponentType<{ size?: number; strokeWidth?: number }>
type Role = 'admin' | 'user'
type Tab = 'Overview' | 'Team performance' | 'Recruit pipeline' | 'Sales tracker' | 'Featured' | 'Resource hub' | 'Content studio' | 'Team calendar' | 'People' | 'Help' | 'Settings' | 'Profile'
type Account = { id: string; name: string; email: string; role: Role; createdAt: string; profilePhoto?: string }
type SalesRecord = { id: string; advisor: string; product: string; premium: number; status: string; date: string; ownerId: string }
type RecruitRecord = { id: string; name: string; stage: string; next: string; owner: string; ownerId: string }
type ResourceRecord = { id: string; title: string; category: string; description: string; ownerId: string; createdAt: string }
type EventRecord = { id: string; title: string; date: string; time: string; ownerId: string }
type DataStore = { sales: SalesRecord[]; recruits: RecruitRecord[]; resources: ResourceRecord[]; events: EventRecord[] }
type WorkspaceSettings = { teamName: string; branchName: string; welcomeMessage: string; currency: string; timezone: string; pipelineStages: string; salesStatuses: string; notifications: boolean }

const initialData: DataStore = { sales: [], recruits: [], resources: [], events: [] }
const initialSettings: WorkspaceSettings = { teamName: 'Team Andeng', branchName: 'First Global Summit Life Insurance Agency', welcomeMessage: 'Build people. Move purpose.', currency: 'PHP (₱)', timezone: 'Asia/Manila', pipelineStages: 'New lead, Screening, Interview, Offer, Onboarding', salesStatuses: 'Submitted, For review, Issued', notifications: true }
const nav: { label: Tab; icon: Icon; admin?: boolean }[] = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Team performance', icon: Users, admin: true },
  { label: 'Recruit pipeline', icon: Target },
  { label: 'Sales tracker', icon: TrendingUp },
  { label: 'Featured', icon: Trophy },
]
const library: { label: Tab; icon: Icon }[] = [
  { label: 'Resource hub', icon: FolderOpen },
  { label: 'Content studio', icon: Grid2X2 },
  { label: 'Team calendar', icon: CalendarDays },
]
function Avatar({ name, photo }: { name: string; photo?: string }) {
  return <span className={`avatar ${photo ? 'has-photo' : ''}`}>{photo ? <img src={photo} alt={`${name}'s profile`} /> : name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span>
}

function EmptyState({ title, copy, action }: { title: string; copy: string; action?: () => void }) {
  return <div className="empty-state"><Sparkles size={28} /><h3>{title}</h3><p>{copy}</p>{action && <button className="primary-button" onClick={action}><Plus size={17} />Add your first record</button>}</div>
}

function Metric({ label, value, copy, icon: Icon }: { label: string; value: string; copy: string; icon: Icon }) {
  return <article className="metric-card"><div className="metric-heading"><span>{label}</span><div className="metric-icon"><Icon size={18} /></div></div><strong className="metric-value">{value}</strong><p>{copy}</p></article>
}

function Auth() {
  const [mode, setMode] = useState<'sign-in' | 'create'>('sign-in')
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim().toLowerCase()
    const password = String(form.get('password') || '')
    if (!email || (!recoveryMode && !password) || (mode === 'create' && !name)) return setMessage('Please complete every required field.')
    if (!supabase) return setMessage('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values first.')
    if (recoveryMode) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname })
      if (error) return setMessage(error.message)
      setMessage('If that email has an account, a password reset link has been sent.')
      return
    }
    if (mode === 'create') {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
      if (error) return setMessage(error.message)
      setMessage('Account created. Check your email to confirm your account, then sign in.')
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
  }

  return <main className="auth-shell"><section className="auth-showcase"><div className="brand"><div className="brand-mark">A</div><div><strong>Team Andeng</strong><span>FIRST GLOBAL SUMMIT</span></div></div><div><p className="eyebrow">TEAM OPERATIONS, MADE CLEAR</p><h1>Build people.<br /><em>Move purpose.</em></h1><p>One clean workspace for your agency’s people, production, pipeline, resources, and momentum.</p></div><div className="auth-circles"><i /><i /><i /></div></section><section className="auth-card-wrap"><form className="auth-card" onSubmit={submit}><div className="auth-icon"><ShieldCheck size={23} /></div><p className="eyebrow">TEAM ANDENG HQ</p><h2>{recoveryMode ? 'Reset your password' : mode === 'sign-in' ? 'Welcome back' : 'Create your workspace account'}</h2><p className="auth-copy">{recoveryMode ? 'Enter your email and we will send a secure password reset link.' : mode === 'sign-in' ? 'Sign in to continue to your dashboard.' : 'New accounts are advisors by default. An administrator assigns admin access securely in Supabase.'}</p>{mode === 'create' && !recoveryMode && <label>Full name<input name="name" placeholder="e.g. Andeng Santos" autoComplete="name" /></label>}<label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" /></label>{!recoveryMode && <label>Password<input name="password" type="password" placeholder="Minimum 6 characters" minLength={6} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} /></label>}{message && <p className="form-message">{message}</p>}<button className="primary-button submit-button" type="submit">{recoveryMode ? 'Send reset link' : mode === 'sign-in' ? 'Sign in' : 'Create account'} <ChevronRight size={17} /></button>{mode === 'sign-in' && !recoveryMode && <button type="button" className="auth-switch" onClick={() => { setRecoveryMode(true); setMessage('') }}>Forgot password?</button>}<button type="button" className="auth-switch" onClick={() => { setRecoveryMode(false); setMode(mode === 'sign-in' ? 'create' : 'sign-in'); setMessage('') }}>{recoveryMode ? 'Back to sign in' : mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button></form></section></main>
}

function ResetPassword() {
  const [message, setMessage] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const password = String(new FormData(event.currentTarget).get('password') || '')
    if (password.length < 6) return setMessage('Use a password with at least 6 characters.')
    if (!supabase) return setMessage('Supabase is not configured.')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setMessage(error.message)
    setMessage('Password updated. You can now sign in with your new password.')
  }

  return <main className="auth-shell"><section className="auth-showcase"><div className="brand"><div className="brand-mark">A</div><div><strong>Team Andeng</strong><span>FIRST GLOBAL SUMMIT</span></div></div><div><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Choose a new<br /><em>password.</em></h1></div><div className="auth-circles"><i /><i /><i /></div></section><section className="auth-card-wrap"><form className="auth-card" onSubmit={submit}><div className="auth-icon"><ShieldCheck size={23} /></div><p className="eyebrow">TEAM ANDENG HQ</p><h2>Set a new password</h2><p className="auth-copy">Use at least 6 characters and keep it private.</p><label>New password<input name="password" type="password" placeholder="Minimum 6 characters" minLength={6} autoComplete="new-password" required /></label>{message && <p className="form-message">{message}</p>}<button className="primary-button submit-button" type="submit">Update password <ChevronRight size={17} /></button></form></section></main>
}

function App() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [data, setData] = useState<DataStore>(initialData)
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(initialSettings)
  const [currentUser, setCurrentUser] = useState<Account | null>(null)
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [modal, setModal] = useState<'sale' | 'recruit' | 'resource' | 'event' | 'account' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const pageName = passwordRecovery ? 'Reset password' : currentUser ? activeTab : 'Sign in'
    document.title = `${pageName} | ${workspaceSettings.teamName}`
  }, [activeTab, currentUser, passwordRecovery, workspaceSettings.teamName])

  const loadWorkspace = async (userId: string, email: string) => {
    if (!supabase) return
    const [{ data: profile }, { data: profiles }, { data: sales }, { data: recruits }, { data: resources }, { data: events }, { data: workspace }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('recruits').select('*').order('created_at', { ascending: false }),
      supabase.from('resources').select('*').order('created_at', { ascending: false }),
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase.from('workspaces').select('*').limit(1).maybeSingle(),
    ])
    if (!profile) {
      setNotice('Your profile is not ready yet. Confirm your email, then refresh the page.')
      return
    }
    setCurrentUser({ id: profile.id, name: profile.name, email, role: profile.role, createdAt: profile.created_at, profilePhoto: profile.profile_photo_url || undefined })
    setAccounts((profiles || []).map(item => ({ id: item.id, name: item.name, email: item.email || '', role: item.role, createdAt: item.created_at, profilePhoto: item.profile_photo_url || undefined })))
    setData({
      sales: (sales || []).map(item => ({ id: item.id, advisor: item.advisor, product: item.product, premium: Number(item.premium), status: item.status, date: item.sale_date, ownerId: item.owner_id })),
      recruits: (recruits || []).map(item => ({ id: item.id, name: item.name, stage: item.stage, next: item.next_action, owner: item.owner_name, ownerId: item.owner_id })),
      resources: (resources || []).map(item => ({ id: item.id, title: item.title, category: item.category, description: item.description || '', ownerId: item.owner_id, createdAt: item.created_at })),
      events: (events || []).map(item => ({ id: item.id, title: item.title, date: item.event_date, time: item.event_time || '', ownerId: item.owner_id })),
    })
    if (workspace) setWorkspaceSettings({ teamName: workspace.team_name, branchName: workspace.branch_name, welcomeMessage: workspace.welcome_message, currency: workspace.currency, timezone: workspace.timezone, pipelineStages: workspace.pipeline_stages, salesStatuses: workspace.sales_statuses, notifications: workspace.notifications })
  }

  useEffect(() => {
    const client = supabase
    if (!client) { setLoading(false); return }
    const initialize = async () => {
      const { data: { session } } = await client.auth.getSession()
      if (session?.user) await loadWorkspace(session.user.id, session.user.email || '')
      setLoading(false)
    }
    void initialize()
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { setPasswordRecovery(true); setLoading(false); return }
      if (!session?.user) { setCurrentUser(null); setAccounts([]); setData(initialData); return }
      void loadWorkspace(session.user.id, session.user.email || '')
    })
    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = currentUser?.role === 'admin'
  const visibleData = useMemo(() => !currentUser ? initialData : isAdmin ? data : {
    sales: data.sales.filter(item => item.ownerId === currentUser.id),
    recruits: data.recruits.filter(item => item.ownerId === currentUser.id),
    resources: data.resources.filter(item => item.ownerId === currentUser.id),
    events: data.events.filter(item => item.ownerId === currentUser.id),
  }, [currentUser, data, isAdmin])

  const logout = async () => {
    await supabase?.auth.signOut()
    setActiveTab('Overview')
  }

  const addRecord = async (type: NonNullable<typeof modal>, values: Record<string, string>) => {
    if (!currentUser) return
    if (!supabase) return
    if (type === 'account') return setNotice('For security, users create their own accounts. Assign roles through the Supabase dashboard until an invitation function is added.')
    const result = type === 'sale'
      ? await supabase.from('sales').insert({ advisor: values.advisor, product: values.product, premium: Number(values.premium), status: values.status, sale_date: values.date || new Date().toISOString().slice(0, 10) })
      : type === 'recruit'
        ? await supabase.from('recruits').insert({ name: values.name, stage: values.stage, next_action: values.next, owner_name: currentUser.name })
        : type === 'resource'
          ? await supabase.from('resources').insert({ title: values.title, category: values.category, description: values.description })
          : await supabase.from('events').insert({ title: values.title, event_date: values.date, event_time: values.time || null })
    const { error } = result
    if (error) return setNotice(error.message)
    await loadWorkspace(currentUser.id, currentUser.email)
    setModal(null)
    setNotice('Saved. Your workspace is up to date.')
  }

  if (loading) return <main className="auth-shell"><p className="auth-copy">Loading workspace…</p></main>
  if (!isSupabaseConfigured) return <Auth />
  if (passwordRecovery) return <ResetPassword />
  if (!currentUser) return <Auth />

  const tabItems = nav.filter(item => !item.admin || isAdmin)
  const go = (tab: Tab) => {
    setActiveTab(tab)
    setMobileOpen(false)
    setWorkspaceMenuOpen(false)
    setAccountMenuOpen(false)
  }

  const toggleNavigation = () => {
    if (window.matchMedia('(max-width: 760px)').matches) {
      setMobileOpen(open => !open)
      return
    }
    setSidebarCollapsed(collapsed => !collapsed)
    setWorkspaceMenuOpen(false)
  }

  const exportData = () => {
    const content = JSON.stringify({ exportedAt: new Date().toISOString(), workspace: workspaceSettings, data, accounts }, null, 2)
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    link.download = 'team-andeng-workspace-export.json'
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice('Workspace data export downloaded.')
  }
  const resetData = async () => {
    if (!window.confirm('Reset all sales, recruits, resources, and calendar events? Accounts and workspace settings will remain.')) return
    const client = supabase
    if (!client || !currentUser) return
    const tables = ['sales', 'recruits', 'resources', 'events'] as const
    const results = await Promise.all(tables.map(table => client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')))
    const error = results.find(result => result.error)?.error
    if (error) return setNotice(error.message)
    await loadWorkspace(currentUser.id, currentUser.email)
    setNotice('Workspace records have been reset to zero.')
  }
  const saveProfile = async (values: Pick<Account, 'name' | 'profilePhoto'>) => {
    if (!supabase || !currentUser) return
    const { error } = await supabase.from('profiles').update({ name: values.name, profile_photo_url: values.profilePhoto || null }).eq('id', currentUser.id)
    if (error) return setNotice(error.message)
    const updatedUser = { ...currentUser, ...values }
    setAccounts(current => current.map(account => account.id === currentUser.id ? { ...account, ...values } : account))
    setCurrentUser(updatedUser)
    setNotice('Profile saved.')
  }

  return <main className="app-shell"><aside className={`sidebar ${mobileOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}><button className="brand brand-home" onClick={() => go('Overview')} aria-label="Go to home" title={sidebarCollapsed ? 'Home' : undefined}><div className="brand-mark">A</div><div><strong>{workspaceSettings.teamName}</strong><span>FIRST GLOBAL SUMMIT</span></div></button><div className="workspace-menu"><button className="workspace-switcher" onClick={() => setWorkspaceMenuOpen(open => !open)} aria-expanded={workspaceMenuOpen} aria-haspopup="menu" title={sidebarCollapsed ? workspaceSettings.teamName : undefined}><span className="team-avatar">HQ</span><span>{workspaceSettings.teamName}</span><ChevronDown className={workspaceMenuOpen ? 'rotated' : ''} size={15} /></button>{workspaceMenuOpen && <div className="workspace-dropdown" role="menu"><div className="workspace-dropdown-title"><span className="team-avatar">HQ</span><div><strong>{workspaceSettings.teamName}</strong><small>{workspaceSettings.branchName}</small></div></div><button role="menuitem" onClick={() => go('Overview')}><LayoutDashboard size={16} />Open dashboard</button>{isAdmin && <button role="menuitem" onClick={() => go('Settings')}><Settings size={16} />Workspace settings</button>}<button role="menuitem" onClick={() => go('Help')}><CircleHelp size={16} />Help & support</button><p>This browser currently has one workspace.</p></div>}</div><nav><p className="nav-label">WORKSPACE</p>{tabItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeTab === label ? 'active' : ''}`} onClick={() => go(label)} title={sidebarCollapsed ? label : undefined}><Icon size={18} /><span>{label}</span>{label === 'Recruit pipeline' && visibleData.recruits.length > 0 && <b>{visibleData.recruits.length}</b>}</button>)}<p className="nav-label library-label">LIBRARY</p>{library.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeTab === label ? 'active' : ''}`} onClick={() => go(label)} title={sidebarCollapsed ? label : undefined}><Icon size={18} /><span>{label}</span></button>)}{isAdmin && <><p className="nav-label library-label">ADMIN</p><button className={`nav-item ${activeTab === 'People' ? 'active' : ''}`} onClick={() => go('People')} title={sidebarCollapsed ? 'People & access' : undefined}><Users size={18} /><span>People & access</span></button></>}</nav><div className="sidebar-bottom"><button className={`nav-item ${activeTab === 'Help' ? 'active' : ''}`} onClick={() => go('Help')} title={sidebarCollapsed ? 'Help & support' : undefined}><CircleHelp size={18} /><span>Help & support</span></button>{isAdmin && <button className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => go('Settings')} title={sidebarCollapsed ? 'Workspace settings' : undefined}><Settings size={18} /><span>Workspace settings</span></button>}<div className="manager-card"><button className="profile-link" onClick={() => go('Profile')} title={sidebarCollapsed ? 'View profile' : undefined}><Avatar name={currentUser.name} photo={currentUser.profilePhoto} /><div><strong>{currentUser.name}</strong><span>{isAdmin ? 'Workspace Admin' : 'Advisor account'}</span></div></button><button className="logout-button" onClick={logout} title="Sign out"><LogOut size={16} /></button></div></div></aside>{mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}<section className="content-area"><header className="topbar"><button className="mobile-menu" onClick={toggleNavigation} aria-label="Toggle navigation"><Menu size={20} /></button><div className="mobile-brand">{workspaceSettings.teamName}</div><label className="search"><Search size={18} /><input placeholder="Search records..."/><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" onClick={() => setNotice('No new notifications.')} aria-label="Notifications"><Bell size={20} /></button><div className="account-menu"><button className="top-profile" onClick={() => setAccountMenuOpen(open => !open)} aria-label="Open account menu" aria-expanded={accountMenuOpen} aria-haspopup="menu"><Avatar name={currentUser.name} photo={currentUser.profilePhoto} /><ChevronDown className={accountMenuOpen ? 'rotated' : ''} size={16} /></button>{accountMenuOpen && <div className="account-dropdown" role="menu"><button className="account-dropdown-title" role="menuitem" onClick={() => go('Profile')}><Avatar name={currentUser.name} photo={currentUser.profilePhoto} /><div><strong>{currentUser.name}</strong><small>{currentUser.email}</small><em>{isAdmin ? 'Workspace Admin' : 'Advisor account'}</em></div></button><button role="menuitem" onClick={() => go('Profile')}><Users size={16} />View profile</button>{isAdmin && <button role="menuitem" onClick={() => go('Settings')}><Settings size={16} />Workspace settings</button>}<button role="menuitem" onClick={() => go('Help')}><CircleHelp size={16} />Help & support</button><button className="account-signout" role="menuitem" onClick={logout}><LogOut size={16} />Sign out</button></div>}</div></div></header><div className="dashboard">{notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice('')}><X size={16} /></button></div>}{activeTab === 'Profile' ? <ProfilePage user={currentUser} onSave={saveProfile} /> : activeTab === 'Help' ? <HelpSupport onNotice={setNotice} /> : activeTab === 'Settings' && isAdmin ? <WorkspaceSettingsPage settings={workspaceSettings} onSave={setWorkspaceSettings} onExport={exportData} onReset={resetData} /> : <Pages tab={activeTab} data={visibleData} isAdmin={isAdmin} user={currentUser} openModal={setModal} go={go} accounts={accounts} />}</div></section>{modal && <RecordModal type={modal} isAdmin={isAdmin} onClose={() => setModal(null)} onSave={addRecord} />}</main>
}

function ProfilePage({ user, onSave }: { user: Account; onSave: (values: Pick<Account, 'name' | 'profilePhoto'>) => void | Promise<void> }) {
  const [name, setName] = useState(user.name)
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || '')
  const [photoError, setPhotoError] = useState('')
  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setPhotoError('Choose an image file.')
    if (file.size > 1024 * 1024) return setPhotoError('Choose an image smaller than 1 MB.')
    setPhotoError('')
    setPhotoError('Upload to Supabase Storage will be enabled after the avatars bucket is configured. Use a hosted image URL for now.')
    event.target.value = ''
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (name.trim()) onSave({ name: name.trim(), profilePhoto: profilePhoto.trim() || undefined })
  }
  return <><div className="page-title"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p className="subhead">Manage the name and profile photo shown across your workspace.</p></div></div><form className="panel settings-card profile-form" onSubmit={submit}><div className="profile-preview"><Avatar name={name || user.name} photo={profilePhoto} /><div><h2>{name || user.name}</h2><p>{user.email}</p></div></div><label>Full name<input value={name} onChange={event => setName(event.target.value)} required /></label><label>Upload profile photo<input type="file" accept="image/*" onChange={selectPhoto} /></label><p className="profile-note">Use a hosted image URL until the Supabase Storage avatars bucket is configured.</p>{photoError && <p className="form-message">{photoError}</p>}<label>Profile photo URL<input value={profilePhoto} onChange={event => setProfilePhoto(event.target.value)} placeholder="https://example.com/photo.jpg" /></label>{profilePhoto && <button className="text-button" type="button" onClick={() => setProfilePhoto('')}>Remove current photo</button>}<button className="primary-button" type="submit">Save profile <ChevronRight size={17} /></button></form></>
}

function HelpSupport({ onNotice }: { onNotice: (message: string) => void }) {
  const [topic, setTopic] = useState('')
  const [details, setDetails] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!topic.trim() || !details.trim()) return onNotice('Add a support topic and short description first.'); setTopic(''); setDetails(''); onNotice('Support request saved. A manager can review it from this browser prototype.') }
  return <><div className="page-title"><div><p className="eyebrow">TEAM ANDENG HQ</p><h1>Help & support</h1><p className="subhead">Quick answers and a clear path when your team needs assistance.</p></div></div><section className="support-grid"><article className="panel support-start"><CircleHelp size={27} /><p className="eyebrow">GETTING STARTED</p><h2>Build confidence, one record at a time.</h2><p>Start with sales, candidates, resources, or events. Your dashboard updates automatically.</p><div className="support-links"><button onClick={() => onNotice('Tip: Use “Add sale” in the Sales tracker to update production and the Featured leaderboard.')}>How do I log a sale?<ChevronRight size={16} /></button><button onClick={() => onNotice('Tip: Users see their own entries. Admins can view the complete workspace and manage access.')}>What can an advisor see?<ChevronRight size={16} /></button><button onClick={() => onNotice('Tip: Add templates as “Social content” in Resource hub, then use Content studio as the team’s creative starting point.')}>Where do templates go?<ChevronRight size={16} /></button></div></article><article className="panel support-form"><p className="eyebrow">SEND A REQUEST</p><h2>Need a hand?</h2><p>Describe the issue or request and save it for follow-up.</p><form onSubmit={submit}><label>Topic<input value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. Need help adding a resource" /></label><label>Details<textarea value={details} onChange={event => setDetails(event.target.value)} placeholder="What happened or what do you need?" /></label><button className="primary-button" type="submit">Save support request <ChevronRight size={16} /></button></form></article></section><section className="support-cards"><article><ShieldCheck size={21} /><div><b>Access & roles</b><span>Admins manage the whole workspace; advisors manage their own records.</span></div></article><article><Download size={21} /><div><b>Keep a backup</b><span>Admins can export the browser-local workspace from Settings.</span></div></article><article><Sparkles size={21} /><div><b>Prototype note</b><span>Data is stored in this browser until a secure backend is connected.</span></div></article></section></>
}

function WorkspaceSettingsPage({ settings, onSave, onExport, onReset }: { settings: WorkspaceSettings; onSave: (settings: WorkspaceSettings) => void; onExport: () => void; onReset: () => void }) {
  const [draft, setDraft] = useState(settings)
  useEffect(() => setDraft(settings), [settings])
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave(draft) }
  return <><div className="page-title"><div><p className="eyebrow">ADMIN CONTROLS</p><h1>Workspace settings</h1><p className="subhead">Shape the team identity, defaults, and data tools for this browser-local workspace.</p></div></div><form className="settings-layout" onSubmit={submit}><article className="panel settings-card"><div className="panel-header"><div><h2>General workspace</h2><p>Visible across the Team Andeng dashboard.</p></div></div><label>Team name<input value={draft.teamName} onChange={event => setDraft({ ...draft, teamName: event.target.value })} /></label><label>Branch / agency<input value={draft.branchName} onChange={event => setDraft({ ...draft, branchName: event.target.value })} /></label><label>Welcome message<textarea value={draft.welcomeMessage} onChange={event => setDraft({ ...draft, welcomeMessage: event.target.value })} /></label></article><article className="panel settings-card"><div className="panel-header"><div><h2>Workflow defaults</h2><p>Document the terms your team uses today.</p></div></div><label>Currency<select value={draft.currency} onChange={event => setDraft({ ...draft, currency: event.target.value })}><option>PHP (₱)</option><option>USD ($)</option></select></label><label>Timezone<select value={draft.timezone} onChange={event => setDraft({ ...draft, timezone: event.target.value })}><option>Asia/Manila</option><option>Asia/Singapore</option></select></label><label>Recruitment stages<textarea value={draft.pipelineStages} onChange={event => setDraft({ ...draft, pipelineStages: event.target.value })} /></label><label>Sales statuses<textarea value={draft.salesStatuses} onChange={event => setDraft({ ...draft, salesStatuses: event.target.value })} /></label><label className="toggle-row"><input type="checkbox" checked={draft.notifications} onChange={event => setDraft({ ...draft, notifications: event.target.checked })} /><span><b>Enable reminder preference</b><small>Stores the preference now; live reminders can be connected later.</small></span></label></article><article className="panel settings-card data-tools"><div className="panel-header"><div><h2>Data management</h2><p>Manage the information stored in this browser.</p></div></div><button type="button" className="secondary-button tool-button" onClick={onExport}><Download size={17} />Export workspace data</button><p className="settings-note">Downloads a JSON backup of workspace settings and records. Account passwords are excluded.</p><button type="button" className="danger-button tool-button" onClick={onReset}>Reset all records</button><p className="settings-note">Removes sales, recruits, resources, and events. Accounts and settings stay in place.</p></article><div className="settings-actions"><button className="primary-button" type="submit">Save workspace settings <ChevronRight size={17} /></button></div></form></>
}

function Pages({ tab, data, isAdmin, user, openModal, go, accounts }: { tab: Tab; data: DataStore; isAdmin: boolean; user: Account; openModal: (modal: 'sale' | 'recruit' | 'resource' | 'event' | 'account') => void; go: (tab: Tab) => void; accounts: Account[] }) {
  const totalPremium = data.sales.reduce((sum, sale) => sum + sale.premium, 0)
  const page = (title: string, subtitle: string, action?: { label: string; type: 'sale' | 'recruit' | 'resource' | 'event' | 'account' }) => <div className="page-title"><div><p className="eyebrow">TEAM ANDENG HQ</p><h1>{title}</h1><p className="subhead">{subtitle}</p></div>{action && <button className="primary-button" onClick={() => openModal(action.type)}><Plus size={18} />{action.label}</button>}</div>

  if (tab === 'Overview') return <>{page(`Welcome, ${user.name.split(' ')[0]}`, isAdmin ? 'Your workspace begins at zero. Add records to unlock the story.' : 'Your account shows the records you add. Start building your momentum.')}<section className="metrics-grid"><Metric label="TEAM PRODUCTION" value={`₱${totalPremium.toLocaleString()}`} copy={data.sales.length ? `${data.sales.length} sales record${data.sales.length === 1 ? '' : 's'} added` : 'No sales records yet'} icon={TrendingUp} /><Metric label={isAdmin ? 'ACTIVE ACCOUNTS' : 'MY SALES'} value={isAdmin ? String(accounts.length) : String(data.sales.length)} copy={isAdmin ? 'Accounts in this workspace' : 'Records added by you'} icon={Users} /><Metric label="RECRUITING PIPELINE" value={`${data.recruits.length} leads`} copy={data.recruits.length ? 'Keep next actions visible' : 'No candidates added yet'} icon={Target} /></section><section className="dashboard-grid"><article className="panel action-panel"><div className="panel-header"><div><h2>Start building your workspace</h2><p>Everything is ready—add only what matters to your team.</p></div></div><div className="quick-actions"><button onClick={() => openModal('sale')}><TrendingUp /><span><b>Log a sale</b><small>Add premium, product, and status</small></span><ChevronRight size={18} /></button><button onClick={() => openModal('recruit')}><UserPlus /><span><b>Add a recruit</b><small>Track the next great advisor</small></span><ChevronRight size={18} /></button><button onClick={() => openModal('resource')}><Upload /><span><b>Add a resource</b><small>Create a downloadable library item</small></span><ChevronRight size={18} /></button><button onClick={() => openModal('event')}><CalendarDays /><span><b>Schedule an event</b><small>Put the next team moment on the calendar</small></span><ChevronRight size={18} /></button></div></article><article className="panel starter-panel"><Sparkles size={25} /><p className="eyebrow">YOUR NEXT MOVE</p><h3>{data.sales.length + data.recruits.length + data.resources.length === 0 ? 'A clean beginning is powerful.' : 'Your workspace is taking shape.'}</h3><p>Use the navigation to manage records. Admins see all entries; advisors see their own.</p><button className="text-button" onClick={() => go('Sales tracker')}>Open sales tracker <ChevronRight size={16} /></button></article></section></>

  if (tab === 'Team performance') return <>{page('Team performance', 'Production and activity across every account in the workspace.')}<section className="metrics-grid"><Metric label="TEAM PRODUCTION" value={`₱${totalPremium.toLocaleString()}`} copy="From all saved sales" icon={TrendingUp} /><Metric label="POLICIES LOGGED" value={String(data.sales.length)} copy="Every record contributes here" icon={FolderOpen} /><Metric label="ACTIVE ADVISORS" value={String(accounts.length)} copy="Active workspace accounts" icon={Users} /></section><article className="panel table-panel"><div className="panel-header"><div><h2>Advisor production</h2><p>Automatically populated from sales records.</p></div></div>{data.sales.length === 0 ? <EmptyState title="No team production yet" copy="Add sales records to turn this page into your live performance board." action={() => openModal('sale')} /> : <SalesTable sales={data.sales} />}</article></>

  if (tab === 'Sales tracker') return <>{page('Sales tracker', 'A clean, manual source of truth for sales and annualized premium.', { label: 'Add sale', type: 'sale' })}<article className="panel table-panel"><div className="panel-header"><div><h2>Sales records</h2><p>{isAdmin ? 'All records in the workspace.' : 'Only sales records added by your account.'}</p></div></div>{data.sales.length === 0 ? <EmptyState title="No sales records yet" copy="Log your first sale and the overview will update automatically." action={() => openModal('sale')} /> : <SalesTable sales={data.sales} />}</article></>

  if (tab === 'Featured') { const consultants = [...data.sales].sort((a, b) => b.premium - a.premium).slice(0, 10); const builders = Object.entries(data.recruits.reduce<Record<string, number>>((result, recruit) => ({ ...result, [recruit.owner]: (result[recruit.owner] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]).slice(0, 10); return <>{page('Featured', 'A view-only celebration of the results already recorded by the team.')}<section className="featured-hero"><div><p className="eyebrow">LIVE LEADERBOARD</p><h2>Make excellence <em>visible.</em></h2><p>The Top 10 lists update from saved team records—no placeholder rankings.</p></div><Trophy size={54} /></section><section className="leaderboards"><article className="panel leaderboard-panel"><div className="panel-header"><div><h2>Top 10 financial consultants</h2><p>Ranked by annualized premium.</p></div></div>{consultants.length === 0 ? <EmptyState title="Leaderboard waiting for results" copy="Sales will appear here after they are logged in Sales tracker." /> : <div className="rank-list">{consultants.map((sale, index) => <div className="rank-row" key={sale.id}><b>{index + 1}</b><Avatar name={sale.advisor} /><span><strong>{sale.advisor}</strong><small>{sale.product}</small></span><em>₱{sale.premium.toLocaleString()} AP</em></div>)}</div>}</article><article className="panel leaderboard-panel"><div className="panel-header"><div><h2>Top agency builders</h2><p>Ranked by candidates added.</p></div></div>{builders.length === 0 ? <EmptyState title="Builder board is ready" copy="Recruiting results will appear here after candidates are added in Recruit pipeline." /> : <div className="rank-list">{builders.map(([name, count], index) => <div className="rank-row" key={name}><b>{index + 1}</b><Avatar name={name} /><span><strong>{name}</strong><small>Agency builder</small></span><em>{count} candidate{count === 1 ? '' : 's'}</em></div>)}</div>}</article></section></> }

  if (tab === 'Recruit pipeline') return <>{page('Recruit pipeline', 'Capture candidates, choose their stage, and never lose the next step.', { label: 'Add candidate', type: 'recruit' })}<article className="panel table-panel"><div className="panel-header"><div><h2>Candidate pipeline</h2><p>{isAdmin ? 'All candidates added in the workspace.' : 'Candidates you have added.'}</p></div></div>{data.recruits.length === 0 ? <EmptyState title="Your pipeline is ready" copy="Add your first candidate to begin tracking recruitment." action={() => openModal('recruit')} /> : <div className="record-list">{data.recruits.map(recruit => <div className="record-row" key={recruit.id}><Avatar name={recruit.name} /><div><b>{recruit.name}</b><span>Added by {recruit.owner}</span></div><label className="tag">{recruit.stage}</label><p>{recruit.next}</p></div>)}</div>}</article></>

  if (tab === 'Resource hub') return <>{page('Resource hub', 'Build a helpful internal library. Add titles and descriptions now; connect cloud files later.', { label: 'Add resource', type: 'resource' })}<section className="resource-grid resource-library">{data.resources.length === 0 ? <div className="panel empty-wide"><EmptyState title="Your resource library is empty" copy="Add playbooks, forms, templates, and training links for advisors to use." action={() => openModal('resource')} /></div> : data.resources.map(resource => <article className="resource-card" key={resource.id}><div className="resource-art"><FolderOpen size={31} /></div><div className="resource-info"><p>{resource.category.toUpperCase()}</p><h3>{resource.title}</h3><span>{resource.description || 'No description added'}</span></div></article>)}</section></>

  if (tab === 'Content studio') return <>{page('Content studio', 'Keep approved creative resources and social templates in one ready-to-use place.')}<section className="content-feature"><div><p className="eyebrow">CREATIVE LIBRARY</p><h2>Create content with <em>purpose.</em></h2><p>Add social templates in the Resource hub now. Every item marked “Social content” becomes part of your team’s approved library.</p><button className="primary-button" onClick={() => openModal('resource')}>Add content resource <ChevronRight size={16} /></button></div><Grid2X2 size={72} /></section></>

  if (tab === 'Team calendar') return <>{page('Team calendar', 'Every huddle, interview, workshop, and win—kept in one place.', { label: 'Add event', type: 'event' })}<article className="panel table-panel"><div className="panel-header"><div><h2>Upcoming events</h2><p>{isAdmin ? 'All events in the workspace.' : 'Events added by your account.'}</p></div></div>{data.events.length === 0 ? <EmptyState title="No events on the calendar" copy="Add an event to create a visible rhythm for your team." action={() => openModal('event')} /> : <div className="event-list">{data.events.map(event => <div className="event-row" key={event.id}><CalendarDays /><div><b>{event.title}</b><span>{event.date} · {event.time || 'Time to be confirmed'}</span></div></div>)}</div>}</article></>

  if (tab === 'People') return <>{page('People & access', 'Manage account creation and visibility for the Team Andeng workspace.', { label: 'Create account', type: 'account' })}<section className="metrics-grid"><Metric label="TOTAL ACCOUNTS" value={String(accounts.length)} copy="Admins and advisors" icon={Users} /><Metric label="ADMIN ACCOUNTS" value={String(accounts.filter(account => account.role === 'admin').length)} copy="Full workspace visibility" icon={ShieldCheck} /><Metric label="ADVISOR ACCOUNTS" value={String(accounts.filter(account => account.role === 'user').length)} copy="Limited to personal records" icon={LockKeyhole} /></section><article className="panel table-panel"><div className="panel-header"><div><h2>Workspace accounts</h2><p>Users can add and see their own records. Admins can see everything.</p></div></div><div className="record-list">{accounts.map(account => <div className="record-row" key={account.id}><Avatar name={account.name} /><div><b>{account.name}</b><span>{account.email}</span></div><label className={`tag ${account.role}`}>{account.role === 'admin' ? 'Admin' : 'Advisor'}</label><p>Created {new Date(account.createdAt).toLocaleDateString()}</p></div>)}</div></article></>

  return <>{page(tab, 'This workspace starts empty and fills with the records your team creates.')}</>
}

function SalesTable({ sales }: { sales: SalesRecord[] }) {
  return <div className="record-list">{sales.map(sale => <div className="record-row sale-row" key={sale.id}><Avatar name={sale.advisor} /><div><b>{sale.advisor}</b><span>{sale.product}</span></div><strong>₱{sale.premium.toLocaleString()}</strong><label className="tag">{sale.status}</label><p>{sale.date}</p></div>)}</div>
}

function RecordModal({ type, isAdmin, onClose, onSave }: { type: 'sale' | 'recruit' | 'resource' | 'event' | 'account'; isAdmin: boolean; onClose: () => void; onSave: (type: 'sale' | 'recruit' | 'resource' | 'event' | 'account', values: Record<string, string>) => void }) {
  const fields: Record<typeof type, { title: string; fields: { name: string; label: string; type?: string; options?: string[]; placeholder?: string }[] }> = {
    sale: { title: 'Add a sale', fields: [{ name: 'advisor', label: 'Advisor name', placeholder: 'Your name or advisor name' }, { name: 'product', label: 'Product', placeholder: 'e.g. PRUHealth Prime' }, { name: 'premium', label: 'Annualized premium', type: 'number', placeholder: '0' }, { name: 'status', label: 'Status', options: ['Submitted', 'For review', 'Issued'] }, { name: 'date', label: 'Date', type: 'date' }] },
    recruit: { title: 'Add a recruit', fields: [{ name: 'name', label: 'Candidate name', placeholder: 'Full name' }, { name: 'stage', label: 'Pipeline stage', options: ['New lead', 'Screening', 'Interview', 'Offer', 'Onboarding'] }, { name: 'next', label: 'Next action', placeholder: 'e.g. Interview · Aug 8' }] },
    resource: { title: 'Add a resource', fields: [{ name: 'title', label: 'Resource title', placeholder: 'e.g. Discovery question bank' }, { name: 'category', label: 'Category', options: ['Playbook', 'Training', 'Forms', 'Social content', 'Sales'] }, { name: 'description', label: 'Short description', placeholder: 'What can advisors use this for?' }] },
    event: { title: 'Add an event', fields: [{ name: 'title', label: 'Event title', placeholder: 'e.g. Production huddle' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'time', label: 'Time', type: 'time' }] },
    account: { title: 'Create account', fields: [{ name: 'name', label: 'Full name', placeholder: 'Advisor name' }, { name: 'email', label: 'Email address', type: 'email', placeholder: 'advisor@example.com' }, { name: 'password', label: 'Temporary password', type: 'password', placeholder: 'At least 6 characters' }, { name: 'role', label: 'Access level', options: ['user', 'admin'] }] },
  }
  const config = fields[type]
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>
    onSave(type, values)
  }
  return <div className="modal-backdrop" role="presentation"><form className="record-modal" onSubmit={submit}><div className="modal-header"><div><p className="eyebrow">TEAM ANDENG HQ</p><h2>{config.title}</h2></div><button type="button" onClick={onClose}><X size={20} /></button></div><p className="modal-copy">{type === 'account' && isAdmin ? 'Choose an access level carefully. Admins can see every record in the workspace.' : 'This record is stored in this browser for the prototype.'}</p>{config.fields.map(field => <label key={field.name}>{field.label}{field.options ? <select name={field.name} required>{field.options.map(option => <option key={option} value={option}>{option === 'user' ? 'Advisor — personal records only' : option === 'admin' ? 'Admin — full workspace access' : option}</option>)}</select> : <input name={field.name} type={field.type || 'text'} placeholder={field.placeholder} required={field.name !== 'time' && field.name !== 'date'} />}</label>)}<div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save record <ChevronRight size={17} /></button></div></form></div>
}

export default App
/*
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FileText,
  FolderOpen,
  Grid2X2,
  LayoutDashboard,
  Medal,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import './App.css'

type Icon = ComponentType<{ size?: number; strokeWidth?: number }>
type Tab = 'Overview' | 'Team performance' | 'Recruit pipeline' | 'Sales tracker' | 'Featured' | 'Resource hub' | 'Content studio' | 'Team calendar'

const teamMembers = [
  { initials: 'AM', name: 'Aira M.', unit: 'Prime Builders', production: '₱286K', progress: 92, color: 'orange' },
  { initials: 'JL', name: 'Jules L.', unit: 'Legacy Circle', production: '₱251K', progress: 84, color: 'purple' },
  { initials: 'KC', name: 'Kai C.', unit: 'Peak Performers', production: '₱224K', progress: 75, color: 'teal' },
  { initials: 'RS', name: 'Rica S.', unit: 'Prime Builders', production: '₱198K', progress: 66, color: 'pink' },
]

const recruits = [
  { name: 'Mika Santos', stage: 'Interview', next: 'Interview · Aug 8', owner: 'Andeng S.', score: 'Warm' },
  { name: 'Sam Villanueva', stage: 'Screening', next: 'Follow-up · Today', owner: 'Jules L.', score: 'Hot' },
  { name: 'Nica Cruz', stage: 'Offer', next: 'Offer review · Aug 6', owner: 'Andeng S.', score: 'Hot' },
  { name: 'Trish Ramos', stage: 'New lead', next: 'First call · Aug 7', owner: 'Aira M.', score: 'New' },
]

const sales = [
  { advisor: 'Aira M.', product: 'PRULink Elite Protector', premium: '₱85,000', status: 'Issued', date: 'Aug 5' },
  { advisor: 'Jules L.', product: 'PRUHealth Prime', premium: '₱62,500', status: 'Submitted', date: 'Aug 4' },
  { advisor: 'Kai C.', product: 'PRULife UK Future', premium: '₱48,000', status: 'For review', date: 'Aug 3' },
  { advisor: 'Rica S.', product: 'PRUActive Plus', premium: '₱36,200', status: 'Issued', date: 'Aug 2' },
]

const featured = [
  { rank: 1, initials: 'AM', name: 'Aira M.', unit: 'Prime Builders', value: '₱286K AP', score: 97, color: 'orange' },
  { rank: 2, initials: 'JL', name: 'Jules L.', unit: 'Legacy Circle', value: '₱251K AP', score: 88, color: 'purple' },
  { rank: 3, initials: 'KC', name: 'Kai C.', unit: 'Peak Performers', value: '₱224K AP', score: 81, color: 'teal' },
  { rank: 4, initials: 'RS', name: 'Rica S.', unit: 'Prime Builders', value: '₱198K AP', score: 72, color: 'pink' },
  { rank: 5, initials: 'DV', name: 'Diane V.', unit: 'Momentum Unit', value: '₱176K AP', score: 68, color: 'blue' },
  { rank: 6, initials: 'MS', name: 'Mika S.', unit: 'Peak Performers', value: '₱163K AP', score: 62, color: 'green' },
]

const resources = [
  { type: 'SOCIAL KIT', title: 'August content calendar', subtitle: '31 ready-to-post templates', icon: Sparkles, tone: 'violet' },
  { type: 'TRAINING', title: 'Closing with confidence', subtitle: 'Masterclass · 42 min', icon: BookOpen, tone: 'blue' },
  { type: 'PLAYBOOK', title: 'New advisor starter kit', subtitle: 'Updated 2 days ago', icon: FileText, tone: 'coral' },
]

function Avatar({ initials, color }: { initials: string; color: string }) {
  return <span className={`avatar ${color}`}>{initials}</span>
}

function MetricCard({ label, value, note, icon: Icon, tint }: { label: string; value: string; note: string; icon: Icon; tint: string }) {
  return <article className="metric-card"><div className="metric-heading"><span>{label}</span><div className={`metric-icon ${tint}`}><Icon size={18} /></div></div><strong className="metric-value">{value}</strong><p>{note}</p></article>
}

function Overview() {
  const [timeframe, setTimeframe] = useState('This month')
  return <>
    <div className="welcome-row"><div><p className="eyebrow">TEAM ANDENG HQ · AUGUST 2026</p><h1>Good morning, Andeng <span>✦</span></h1><p className="subhead">Your team is building momentum. Here’s today’s snapshot.</p></div><button className="primary-button"><Plus size={18} />Add record</button></div>
    <section className="metrics-grid"><MetricCard label="TEAM PRODUCTION" value="₱2.48M" note="↑ 18.4% vs. last month" icon={TrendingUp} tint="lavender" /><MetricCard label="ACTIVE ADVISORS" value="47 / 53" note="+3 advisors this month" icon={Users} tint="mint" /><MetricCard label="RECRUITING PIPELINE" value="32 leads" note="12 need your attention" icon={Target} tint="peach" /></section>
    <section className="dashboard-grid"><article className="panel chart-panel"><div className="panel-header"><div><h2>Production performance</h2><p>Annualized premium generated by your team</p></div><button className="select-button" onClick={() => setTimeframe(timeframe === 'This month' ? 'Last month' : 'This month')}>{timeframe}<ChevronDown size={15} /></button></div><div className="chart-legend"><span><i className="legend-dot purple-dot" />Team production</span><span><i className="legend-dot gray-dot" />Target</span><b>₱3.0M <small>monthly goal</small></b></div><div className="chart-wrap"><div className="y-axis"><span>₱3M</span><span>₱2M</span><span>₱1M</span><span>₱0</span></div><div className="line-chart"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 680 210" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#8357e8" stopOpacity=".22"/><stop offset="1" stopColor="#8357e8" stopOpacity="0"/></linearGradient></defs><path d="M0,190 C35,182 45,160 77,165 S120,126 151,145 S196,138 225,125 S270,144 300,118 S344,103 375,112 S421,66 452,80 S492,98 524,64 S568,55 600,43 S640,28 680,20 L680,210 L0,210Z" fill="url(#fill)"/><path d="M0,190 C35,182 45,160 77,165 S120,126 151,145 S196,138 225,125 S270,144 300,118 S344,103 375,112 S421,66 452,80 S492,98 524,64 S568,55 600,43 S640,28 680,20" fill="none" stroke="#8057df" strokeWidth="3"/></svg><div className="months"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></div></div><div className="chart-insight"><Sparkles size={17} /><span><b>Momentum is building.</b> You’re 82% to your monthly goal with 18 days to go.</span><ChevronRight size={18} /></div></article><article className="panel pulse-panel"><div className="panel-header"><div><h2>Team pulse</h2><p>Latest wins and momentum</p></div><button className="text-button">View all</button></div><div className="pulse-list"><div><Avatar initials="AM" color="orange"/><p><b>Aira M.</b> closed a policy<strong>₱85,000 AP</strong></p><small>12m ago</small></div><div><Avatar initials="JL" color="purple"/><p><b>Jules L.</b> sent a proposal<strong>PRUHealth Prime</strong></p><small>35m ago</small></div><div><Avatar initials="KC" color="teal"/><p><b>Kai C.</b> completed training<strong>Foundation training</strong></p><small>1h ago</small></div></div><button className="celebrate"><span>🎉</span><div><b>Celebrate a win</b><small>Share team momentum</small></div><ChevronRight size={18} /></button></article></section>
    <section className="resources-section"><div className="section-heading"><div><h2>Built for your next win</h2><p>Fresh tools and content to keep advisors moving.</p></div><button className="text-button">Browse resource hub <ChevronRight size={16} /></button></div><div className="resource-grid">{resources.map(({ type, title, subtitle, icon: Icon, tone }) => <article className="resource-card" key={title}><div className={`resource-art ${tone}`}><Icon size={31} /><span className="decor one" /><span className="decor two" /></div><div className="resource-info"><p>{type}</p><h3>{title}</h3><span>{subtitle}</span><button>Open <ChevronRight size={15} /></button></div></article>)}</div></section>
  </>
}

function TeamPerformance() { return <Page title="Team performance" subtitle="See who is winning, who needs coaching, and where to focus next." action="Export report"><section className="metrics-grid"><MetricCard label="TOTAL ADVISORS" value="53" note="47 active this month" icon={Users} tint="mint"/><MetricCard label="GOAL ATTAINMENT" value="82%" note="↑ 9% from July" icon={Target} tint="lavender"/><MetricCard label="TEAM RETENTION" value="96%" note="Above agency target" icon={TrendingUp} tint="peach"/></section><article className="panel table-panel"><div className="panel-header"><div><h2>Advisor momentum board</h2><p>August annualized premium and target attainment</p></div><button className="select-button">August <ChevronDown size={15}/></button></div><div className="member-list">{teamMembers.map(member => <div className="member-row" key={member.name}><Avatar initials={member.initials} color={member.color}/><div className="member-name"><b>{member.name}</b><span>{member.unit}</span></div><div className="progress"><i><span style={{width:`${member.progress}%`}}/></i><small>{member.progress}% to goal</small></div><strong>{member.production}</strong><button className="more-button"><MoreHorizontal size={18}/></button></div>)}</div></article></Page> }

function RecruitPipeline() { return <Page title="Recruit pipeline" subtitle="Turn every promising conversation into your next great advisor." action="Add candidate"><section className="metrics-grid"><MetricCard label="TOTAL LEADS" value="32" note="+8 added this week" icon={Users} tint="mint"/><MetricCard label="INTERVIEWS" value="8" note="3 scheduled this week" icon={CalendarDays} tint="lavender"/><MetricCard label="OFFER STAGE" value="3" note="Awaiting a final decision" icon={Target} tint="peach"/></section><article className="panel table-panel"><div className="panel-header"><div><h2>Candidate pipeline</h2><p>Keep every next step clear and on time.</p></div><button className="select-button">All stages <ChevronDown size={15}/></button></div><div className="candidate-list">{recruits.map((recruit) => <div className="candidate-row" key={recruit.name}><Avatar initials={recruit.name.split(' ').map(x => x[0]).join('')} color={recruit.score === 'Hot' ? 'orange' : 'purple'}/><div><b>{recruit.name}</b><span>{recruit.owner}</span></div><label className={`tag ${recruit.stage.toLowerCase().replace(' ', '-')}`}>{recruit.stage}</label><p>{recruit.next}</p><button className="more-button"><MoreHorizontal size={18}/></button></div>)}</div></article></Page> }

function SalesTracker() { return <Page title="Sales tracker" subtitle="Keep a clean view of production, submissions, and issued policies." action="Add policy"><section className="metrics-grid"><MetricCard label="ANNUALIZED PREMIUM" value="₱2.48M" note="↑ 18.4% from July" icon={TrendingUp} tint="lavender"/><MetricCard label="ISSUED POLICIES" value="42" note="8 issued this week" icon={FileText} tint="mint"/><MetricCard label="FOR REVIEW" value="11" note="Follow up within 48 hours" icon={CircleHelp} tint="peach"/></section><article className="panel table-panel"><div className="panel-header"><div><h2>Recent production</h2><p>Use this list as your source of truth for sales tracking.</p></div><button className="select-button">August <ChevronDown size={15}/></button></div><div className="sales-list">{sales.map(sale => <div className="sale-row" key={sale.advisor + sale.product}><Avatar initials={sale.advisor.split(' ').map(x => x[0]).join('')} color="purple"/><div><b>{sale.advisor}</b><span>{sale.product}</span></div><strong>{sale.premium}</strong><label className={`tag ${sale.status.toLowerCase().replace(' ', '-')}`}>{sale.status}</label><p>{sale.date}</p></div>)}</div></article></Page> }

function Featured() { const [board, setBoard] = useState<'consultants' | 'builders'>('consultants'); return <Page title="Featured" subtitle="Celebrate the people moving Team Andeng forward." action="Share leaderboard"><section className="featured-hero"><div><span className="hero-kicker"><Trophy size={16}/> AUGUST LEADERBOARD</span><h2>Make excellence <em>visible.</em></h2><p>Recognition fuels momentum. Spotlight your top financial consultants and agency builders each month.</p></div><div className="trophy-orb"><Trophy size={54}/><span>TOP 10</span></div></section><div className="leaderboard-tabs"><button className={board === 'consultants' ? 'selected' : ''} onClick={() => setBoard('consultants')}><Medal size={17}/>Top 10 financial consultants</button><button className={board === 'builders' ? 'selected' : ''} onClick={() => setBoard('builders')}><Users size={17}/>Top agency builders</button></div><section className="leaderboards"><article className="panel leaderboard-panel"><div className="panel-header"><div><h2>{board === 'consultants' ? 'Top 10 financial consultants' : 'Top 10 agency builders'}</h2><p>{board === 'consultants' ? 'Ranked by August annualized premium' : 'Ranked by recruits and advisor development'}</p></div><button className="select-button">August <ChevronDown size={15}/></button></div><div className="rank-list">{featured.map((entry) => <div className="rank-row" key={entry.name}><span className={`rank rank-${entry.rank}`}>{entry.rank}</span><Avatar initials={entry.initials} color={entry.color}/><div><b>{entry.name}</b><span>{entry.unit}</span></div><div className="rank-meter"><i><span style={{ width: `${board === 'builders' ? entry.score - 12 : entry.score}%` }}/></i></div><strong>{board === 'consultants' ? entry.value : `${Math.round(entry.score / 9)} new advisors`}</strong></div>)}</div></article><aside className="panel recognition-card"><span className="spotlight-icon">✦</span><p className="eyebrow">MANAGER MOMENT</p><h3>Recognition is a growth habit.</h3><p>Share a win, encourage the next move, and make progress feel seen.</p><button className="primary-button">Create spotlight <ArrowUpRight size={16}/></button></aside></section></Page> }

function ResourceHub() { return <Page title="Resource hub" subtitle="Your organized, shareable home for advisor files and playbooks." action="Upload file"><section className="resource-grid resource-library">{[...resources, { type: 'FORMS', title: 'Client review toolkit', subtitle: '12 downloadable templates', icon: FolderOpen, tone: 'blue' }, { type: 'ONBOARDING', title: 'First 30 days guide', subtitle: 'Advisor launch checklist', icon: Target, tone: 'violet' }, { type: 'SALES', title: 'Discovery question bank', subtitle: 'Conversation framework', icon: BookOpen, tone: 'coral' }].map(({type,title,subtitle,icon: Icon,tone}) => <article className="resource-card" key={title}><div className={`resource-art ${tone}`}><Icon size={31}/><span className="decor one"/><span className="decor two"/></div><div className="resource-info"><p>{type}</p><h3>{title}</h3><span>{subtitle}</span><button>Open <ChevronRight size={15}/></button></div></article>)}</section></Page> }

function ContentStudio() { return <Page title="Content studio" subtitle="Give every advisor confidence to post consistently and professionally." action="Create template"><section className="content-feature"><div><span className="hero-kicker"><Sparkles size={16}/> CONTENT DROP</span><h2>August is made for <em>momentum.</em></h2><p>Keep your social presence fresh with campaign-ready captions, graphics, and story prompts.</p><button className="primary-button">Explore campaign <ArrowUpRight size={16}/></button></div><div className="post-stack"><article>Protect what<br/><b>matters most.</b><span>TEAM ANDENG</span></article><article>YOUR FUTURE<br/><b>STARTS NOW.</b><span>PRU LIFE UK</span></article></div></section><section className="template-grid">{['Monday motivation', 'Protection made personal', 'Advisor life behind the scenes', 'Client story prompt'].map((title, index) => <article className="template-card" key={title}><div className={`template-art art-${index + 1}`}><Sparkles size={25}/></div><p>SOCIAL TEMPLATE</p><h3>{title}</h3><button>Use template <ChevronRight size={15}/></button></article>)}</section></Page> }

function TeamCalendar() { const days = ['Mon 4','Tue 5','Wed 6','Thu 7','Fri 8']; const events = [['Production huddle','9:00 AM'],['Candidate interviews','2:00 PM'],['Sales workshop','10:00 AM'],['Social content drop','All day'],['Win Friday call','4:00 PM']]; return <Page title="Team calendar" subtitle="Keep every huddle, interview, workshop, and win in view." action="Add event"><article className="panel calendar-panel"><div className="calendar-top"><button className="select-button">August 2026 <ChevronDown size={15}/></button><span><button>‹</button><button>Today</button><button>›</button></span></div><div className="calendar-grid">{days.map((day, i) => <div className="calendar-day" key={day}><b>{day}</b><div className={`calendar-event event-${i}`}>{events[i][0]}<small>{events[i][1]}</small></div>{i === 1 && <div className="calendar-event soft">Recruit follow-ups<small>4:30 PM</small></div>}</div>)}</div></article></Page> }

function Page({ title, subtitle, action, children }: { title: string; subtitle: string; action: string; children: React.ReactNode }) { return <><div className="page-title"><div><p className="eyebrow">TEAM ANDENG HQ</p><h1>{title}</h1><p className="subhead">{subtitle}</p></div><button className="primary-button"><Plus size={18}/>{action}</button></div>{children}</> }

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const nav: { label: Tab; icon: Icon }[] = [{label:'Overview',icon:LayoutDashboard},{label:'Team performance',icon:Users},{label:'Recruit pipeline',icon:Target},{label:'Sales tracker',icon:TrendingUp},{label:'Featured',icon:Trophy}]
  const library: { label: Tab; icon: Icon }[] = [{label:'Resource hub',icon:FolderOpen},{label:'Content studio',icon:Grid2X2},{label:'Team calendar',icon:CalendarDays}]
  const renderTab = () => ({ Overview:<Overview/>, 'Team performance':<TeamPerformance/>, 'Recruit pipeline':<RecruitPipeline/>, 'Sales tracker':<SalesTracker/>, Featured:<Featured/>, 'Resource hub':<ResourceHub/>, 'Content studio':<ContentStudio/>, 'Team calendar':<TeamCalendar/> }[activeTab])
  return <main className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">A</div><div><strong>Team Andeng</strong><span>FIRST GLOBAL SUMMIT</span></div></div><button className="workspace-switcher"><span className="team-avatar">TA</span><span>Team Andeng HQ</span><ChevronDown size={15}/></button><nav><p className="nav-label">WORKSPACE</p>{nav.map(({label,icon: Icon}) => <button key={label} className={`nav-item ${activeTab === label ? 'active' : ''}`} onClick={() => setActiveTab(label)}><Icon size={18}/><span>{label}</span>{label === 'Recruit pipeline' && <b>12</b>}</button>)}<p className="nav-label library-label">LIBRARY</p>{library.map(({label,icon: Icon}) => <button key={label} className={`nav-item ${activeTab === label ? 'active' : ''}`} onClick={() => setActiveTab(label)}><Icon size={18}/><span>{label}</span></button>)}</nav><div className="sidebar-bottom"><button className="nav-item"><CircleHelp size={18}/><span>Help & support</span></button><button className="nav-item"><Settings size={18}/><span>Workspace settings</span></button><div className="manager-card"><div className="profile-avatar">A</div><div><strong>Andeng S.</strong><span>Agency Manager</span></div><MoreHorizontal size={18}/></div></div></aside><section className="content-area"><header className="topbar"><div className="mobile-brand">Team Andeng</div><label className="search"><Search size={18}/><input placeholder="Search anything..."/><kbd>⌘ K</kbd></label><div className="top-actions"><button className="icon-button" onClick={() => setShowNotifications(!showNotifications)} aria-label="Notifications"><Bell size={20}/><i/></button>{showNotifications && <div className="notification-popover"><strong>You're all caught up!</strong><span>No new notifications right now.</span></div>}<div className="top-profile"><div className="profile-avatar">A</div><ChevronDown size={16}/></div></div></header><div className="dashboard">{renderTab()}</div></section></main>
}
*/
