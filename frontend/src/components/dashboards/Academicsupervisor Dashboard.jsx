import { useState } from "react";
import api from '../utils/api';
import Card from '../Shared/Card';
import List from '../Shared/list';
import '../styles/Dashboard.css';

export default function AcademicsupervisorDashboard() {
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