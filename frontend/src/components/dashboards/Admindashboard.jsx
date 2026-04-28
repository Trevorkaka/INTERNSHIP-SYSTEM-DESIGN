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
 
        {activeTab === 'users' && (
          <Card title={`All Users (${filteredUsers.length})`}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ marginRight: 8 }}>Filter by role:</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="academic_supervisor">Academic Supervisors</option>
                <option value="workplace_supervisor">Workplace Supervisors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
 
            {filteredUsers.length === 0 ? (
              <div style={{ padding: '12px', color: '#64748b' }}>No users found.</div>
            ) : (
              <List
                items={filteredUsers}
                keyExtractor={(user) => user.id}
                renderItem={(user) => (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{user.username}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{user.email}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor: '#f0f9ff',
                            color: '#0369a1',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            textTransform: 'capitalize',
                          }}
                        >
                          {user.role?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              />
            )}
          </Card>
        )}
 
        {activeTab === 'students' && (
          <Card title={`Students (${students.length})`}>
            {students.length === 0 ? (
              <div style={{ padding: '12px', color: '#64748b' }}>No students registered.</div>
            ) : (
              <List
                items={students}
                keyExtractor={(student) => student.id}
                renderItem={(student) => (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{student.user?.first_name} {student.user?.last_name}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          {student.registration_number}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{student.course}</div>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>Year {student.year_of_study}</div>
                      </div>
                    </div>
                  </div>
                )}
              />
            )}
          </Card>
        )}
 
        {activeTab === 'supervisors' && (
          <Card title={`Supervisors (${supervisors.length})`}>
            {supervisors.length === 0 ? (
              <div style={{ padding: '12px', color: '#64748b' }}>No supervisors registered.</div>
            ) : (
              <List
                items={supervisors}
                keyExtractor={(supervisor) => supervisor.id}
                renderItem={(supervisor) => (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{supervisor.user?.first_name} {supervisor.user?.last_name}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{supervisor.user?.email}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{supervisor.company_name}</div>
                      </div>
                    </div>
                  </div>
                )}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
 


