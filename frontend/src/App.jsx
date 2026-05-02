import { useState } from 'react'
import './App.css'
import { StudentDashboard, WorkplaceSupervisorDashboard, Login } from './components/auth/dashboards'

function App() {
  const [view, setView] = useState('home')
  const [user, setUser] = useState(null)

  return (
    <div>
      <header className="app-header">
        <button onClick={() => setView('home')}>Home</button>
        <button onClick={() => setView('students')}>Students</button>
        <button onClick={() => setView('supervisors')}>Workplace Supervisors</button>
        <div style={{ float: 'right' }}>
          {user ? (
            <span>Signed in as {user.username}</span>
          ) : (
            <button onClick={() => setView('login')}>Login</button>
          )}
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {view === 'home' && (
          <div>
            <h1>Internship System Dashboards</h1>
            <p>Choose a dashboard from the top navigation.</p>
          </div>
        )}

        {view === 'login' && <Login onLogin={(u) => { setUser(u); setView('home') }} />}

        {view === 'students' && <StudentDashboard />}

        {view === 'supervisors' && <WorkplaceSupervisorDashboard />}
      </main>
    </div>
  )
}

export default App
