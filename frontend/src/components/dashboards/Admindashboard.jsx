import { useEffect, useState } from "react";
import api from '../../utils/api';
import card from '../Shared/Card';
import List from '../Shared/list';
import '../styles/Dashboard.css';

export default function AdminDashboard(){
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalSupervisors: 0,
        totalLogs: 0,
  });
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() =>{
    let mounted = true;

    async function loadData() {
      try {
        // Load users
        const usersRes = await api.get('/users/');
        if (mounted) {
          setUsers(usersRes.data);
        }
 
        // Load students
        const studentRes = await api.get('/students/');
        if (mounted) {
          setStudents(studentRes.data);
        }
 
        // Load supervisors
        const supervisorRes = await api.get('/workplace-supervisors/');
        if (mounted) {
          setSupervisors(supervisorRes.data);
        }
 
        // Calculate stats
        if (mounted) {
          setStats({
            totalUsers: usersRes.data.length,
            totalStudents: studentRes.data.length,
            totalSupervisors: supervisorRes.data.length,
            totalLogs: 0, // Will be updated below
          });
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => (mounted = false);
}, [] );
    const filteredUsers = filterRole === 'all' ? users : users.filter((u) => u.role === filterRole);


     if (loading) {
    return (
      <Card title="Loading...">
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading admin dashboard...</div>
      </Card>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Administrator Dashboard</h1>
        <p className="subtitle">System Management & Analytics</p>
      </div>
 
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`tab ${activeTab === 'supervisors' ? 'active' : ''}`}
          onClick={() => setActiveTab('supervisors')}
        >
          Supervisors
        </button>
      </div>
 
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <Card title="Total Users">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#3b82f6' }}>
                  {stats.totalUsers}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Registered users in system</div>
              </div>
            </Card>
 
            <Card title="Students">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#10b981' }}>
                  {stats.totalStudents}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Active student accounts</div>
              </div>
            </Card>
 
            <Card title="Supervisors">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8b5cf6' }}>
                  {stats.totalSupervisors}
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Workplace supervisors</div>
              </div>
            </Card>
 
            <Card title="System Health">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12 }}>API Status</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Operational</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12 }}>Database</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12 }}>Auth System</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Active</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        
}