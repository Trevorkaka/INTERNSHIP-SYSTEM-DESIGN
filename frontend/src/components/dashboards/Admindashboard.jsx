import { useState } from "react";
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
}