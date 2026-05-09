import { useState, useEffect } from 'react'

interface Props {
  onEnter: () => void
}

const DEVELOPERS = [
  { name: 'KATO TREVOR',            reg: '25/U/26202/PS' },
  { name: 'MUGALU BENJAMIN',        reg: '25/U/03457/PS' },
  { name: 'CESTO MATTHEW ONGOL',    reg: '25/U/31082/PS' },
  { name: 'MWESIGWA ERIA PAUL',     reg: '25/U/03486/PS' },
  { name: 'SUUBI GEORGE WILLIAM',   reg: '25/U/03591/EVE' },
]

const FEATURES = [
  { icon: '📋', label: 'Weekly Log Submission',    desc: 'Students submit activity logs every week' },
  { icon: '⭐', label: 'Supervisor Assessments',   desc: 'Workplace supervisors review and grade logs' },
  { icon: '🎓', label: 'Academic Evaluations',     desc: 'Academic supervisors evaluate student progress' },
  { icon: '🔔', label: 'Real-time Notifications',  desc: 'Instant alerts for reviews and approvals' },
  { icon: '📊', label: 'Performance Analytics',    desc: 'Track progress and scores over time' },
  { icon: '🏢', label: 'Placement Management',     desc: 'Admin manages internship placements' },
]

export default function WelcomePage({ onEnter }: Props) {
  const [visible, setVisible] = useState(false)
  const [featureIndex, setFeatureIndex] = useState(0)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
    const interval = setInterval(() => {
      setFeatureIndex(i => (i + 1) % FEATURES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const handleEnter = () => {
    setEntered(true)
    setTimeout(onEnter, 600)
  }

  return (
    <div className={`min-h-screen bg-gray-950 text-white overflow-hidden relative transition-opacity duration-500 ${entered ? 'opacity-0' : 'opacity-100'}`}>

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl animate-pulse"/>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}/>
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-blue-400/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}/>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>
      </div>

      <div className={`relative z-10 min-h-screen flex flex-col transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-base">IL</div>
            <div>
              <div className="font-black text-lg tracking-tight">ILES</div>
              <div className="text-white/30 text-[10px] tracking-widest uppercase">Internship System</div>
            </div>
          </div>
          <div className="text-white/30 text-xs">Makerere University · 2026</div>
        </div>

        {/* Hero section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"/>
            Year 1 Group20 Project · Computer Science
          </div>

          {/* Title */}
          <h1 className="text-6xl font-black tracking-tighter mb-4 leading-none">
            <span className="text-white">Internship</span>
            <br/>
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Logging & Evaluation
            </span>
            <br/>
            <span className="text-white">System</span>
          </h1>

          <p className="text-white/40 text-lg max-w-xl mt-4 mb-10 leading-relaxed">
            A unified platform for students, workplace supervisors, academic supervisors,
            and administrators to manage internship experiences.
          </p>

          {/* Rotating feature highlight */}
          <div className="mb-10 h-20 flex items-center justify-center">
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm min-w-80 transition-all duration-500">
              <div className="text-3xl">{FEATURES[featureIndex].icon}</div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{FEATURES[featureIndex].label}</div>
                <div className="text-xs text-white/40 mt-0.5">{FEATURES[featureIndex].desc}</div>
              </div>
            </div>
          </div>

          {/* Feature dots */}
          <div className="flex gap-2 mb-12">
            {FEATURES.map((_, i) => (
              <button key={i} onClick={() => setFeatureIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === featureIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-white/20'}`}/>
            ))}
          </div>

          {/* CTA Button */}
          <button onClick={handleEnter}
            className="group relative px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
            <span className="relative z-10 flex items-center gap-3">
              Enter System
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>

          <p className="text-white/20 text-xs mt-4">Click to access the login page</p>
        </div>

        {/* Features grid */}
        <div className="px-8 pb-10">
          <div className="grid grid-cols-6 gap-3 max-w-4xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={i} className={`p-4 rounded-xl border transition-all duration-300 text-center
                ${i === featureIndex
                  ? 'bg-blue-600/20 border-blue-500/40'
                  : 'bg-white/3 border-white/8 hover:bg-white/6'}`}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-[10px] font-semibold text-white/60 leading-tight">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Developers section */}
        <div className="px-8 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="border border-white/8 rounded-2xl p-6 bg-white/3 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">Developed By</div>
                <div className="text-sm text-white/50">Group 20 · Department of Computer Science</div>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {DEVELOPERS.map((dev, i) => (
                  <div key={i} className="text-center p-3 bg-white/4 hover:bg-white/8 rounded-xl transition-colors border border-white/6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-black text-sm mx-auto mb-2">
                      {dev.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="text-[11px] font-bold text-white leading-tight">{dev.name}</div>
                    <div className="text-[9px] text-white/30 mt-1 font-mono">{dev.reg}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
