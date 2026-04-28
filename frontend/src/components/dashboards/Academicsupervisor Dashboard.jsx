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