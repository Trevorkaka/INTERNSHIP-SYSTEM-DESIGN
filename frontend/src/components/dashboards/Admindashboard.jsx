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
 
  })
}