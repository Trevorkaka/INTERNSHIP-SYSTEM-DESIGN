import { useState, useEffect } from "react";
import api from '../../utils/api';
import Card from '../Shared/Card';
import List from '../Shared/List';
import '../styles/Dashboard.css';

export default function AcademicSupervisorDashboard() {
    const [supervisors, setSupervisors] = useState([]);
    const [students, setStudents] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedStudent, setSelectedStudent] = useState(null);


    useEffect(() => {
    let mounted = true;
 
    async function loadData() {
      try {
        // Load academic supervisors
        const supervisorRes = await api.get('/academic-supervisors/');
        if (mounted) setSupervisors(supervisorRes.data);
 
        // Load all students
        const studentRes = await api.get('/students/');
        if (mounted) setStudents(studentRes.data);
 
        // Load evaluations
        const evaluationRes = await api.get('/evaluations/');
        if (mounted) setEvaluations(evaluationRes.data);
 
        // Load assessments
        const assessmentRes = await api.get('/assessments/');
        if (mounted) setAssessments(assessmentRes.data);
      } catch (err) {
        console.error('Error loading supervisor data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
 
    loadData();
    return () => (mounted = false);
  }, []);
 
  if (loading) {
    return (
      <Card title="Loading...">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading academic supervisor dashboard...
        </div>
      </Card>
    );
  }

   if (supervisors.length === 0) {
    return (
      <Card title="No Supervisor Profile">
        <div>Your academic supervisor profile is not yet set up.</div>
      </Card>
    );
  }
 
  const supervisor = supervisors[0];
  const supervisedStudents = students.filter((s) => s.academic_supervisor?.id === supervisor.user?.id);
  const studentEvaluations = evaluations.filter((e) =>
    supervisedStudents.some((s) => s.id === e.log?.student)
  );
 
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Academic Supervisor Dashboard</h1>
        <p className="subtitle">
          Welcome, {supervisor.user?.first_name || supervisor.user?.username}!
        </p>
      </div>
 
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Supervised Students
        </button>
        <button
          className={`tab ${activeTab === 'evaluations' ? 'active' : ''}`}
          onClick={() => setActiveTab('evaluations')}
        >
          Evaluations
        </button>
      </div>
 
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <Card title="Profile Information">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ color: '#64748b', fontSize: 12 }}>Name</label>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {supervisor.user?.first_name} {supervisor.user?.last_name}
                  </div>
                </div>
                <div>
                  <label style={{ color: '#64748b', fontSize: 12 }}>Email</label>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{supervisor.user?.email}</div>
                </div>
                <div>
                  <label style={{ color: '#64748b', fontSize: 12 }}>Department</label>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{supervisor.department}</div>
                </div>
              </div>
            </Card>
 
            <Card title="Quick Stats">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Supervised Students:</span>
                  <strong style={{ fontSize: 18, color: '#3b82f6' }}>{supervisedStudents.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Evaluations:</span>
                  <strong style={{ fontSize: 18, color: '#10b981' }}>{studentEvaluations.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Total Assessments:</span>
                  <strong style={{ fontSize: 18, color: '#8b5cf6' }}>{assessments.length}</strong>
                </div>
              </div>
            </Card>
          </div>
        )}
 
        {activeTab === 'students' && (
          <>
            {selectedStudent ? (
              <Card title={`${selectedStudent.user?.first_name} ${selectedStudent.user?.last_name} - Details`}>
                <div style={{ marginBottom: 16 }}>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#e5e7eb',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      marginBottom: 12,
                    }}
                  >
                    ← Back to Students
                  </button>
                </div>
 
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Username</label>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedStudent.user?.username}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Email</label>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedStudent.user?.email}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Registration</label>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedStudent.registration_number}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Course</label>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedStudent.course}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontSize: 12, display: 'block' }}>Year</label>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Year {selectedStudent.year_of_study}</div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card title={`Supervised Students (${supervisedStudents.length})`}>
                {supervisedStudents.length === 0 ? (
                  <div style={{ padding: '12px', color: '#64748b' }}>
                    No students assigned to your supervision yet.
                  </div>
                ) : (
                  <List
                    items={supervisedStudents}
                    //keyExtractor={(student) => student.id}
                    renderItem={(student) => (
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{student.user?.first_name} {student.user?.last_name}</strong>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {student.registration_number}
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12,
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    )}
                  />
                )}
              </Card>
            )}
          </>
        )}
 
        {activeTab === 'evaluations' && (
          <Card title={`Evaluations (${studentEvaluations.length})`}>
            {studentEvaluations.length === 0 ? (
              <div style={{ padding: '12px', color: '#64748b' }}>
                No evaluations recorded yet.
              </div>
            ) : (
              <List
                items={studentEvaluations}
               // keyExtractor={(evaluation) => evaluation.id}
                renderItem={(evaluation) => (
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{evaluation.criteria?.name}</strong>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Week {evaluation.log?.week_number}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>
                          {evaluation.score}/{evaluation.criteria?.max_score}
                        </div>
                      </div>
                    </div>
                    {evaluation.feedback && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
                        Feedback: {evaluation.feedback.substring(0, 100)}...
                      </div>
                    )}
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
 