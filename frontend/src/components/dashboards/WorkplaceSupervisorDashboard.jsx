import React, { useState, useEffect } from "react";
import api from './API'; 
import Card from './Card'; 
import './dashboard.css';

export default function WorkplaceSupervisorDashboard() {
    const [logs, setLogs] = useState([]); // We fetch logs directly because your backend filters them!
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/weekly-logs/'); 
            setLogs(res.data);
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

     useEffect(() => {
        fetchLogs();
    }, []);

    const handleReview = async (logId) => {
        try {
            await api.post(`/weekly-logs/${logId}/review/`);
            alert("Log marked as reviewed!");
            fetchLogs(); // Refresh the list
        } catch (err) {
            alert(err.response?.data?.error || "Error reviewing log");
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '20px' }}>
            <h1 style={{ color: '#1a1c2e' }}>Workplace Supervisor Portal</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>Review and verify student weekly logs.</p>
            
            <Card title="Pending Log Reviews">
                {loading ? (
                    <div>Loading logs...</div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>No logs submitted for review yet.</div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        {logs.map((log) => (
                            <div key={log.id} style={logBoxStyle}>
                                <div>
                                    <span style={badgeStyle(log.status)}>{log.status.toUpperCase()}</span>
                                    <h3 style={{ margin: '10px 0 5px 0' }}>Week {log.week_number} Log</h3>
                                    <p style={{ fontSize: '14px', color: '#475569' }}><strong>Activities:</strong> {log.activities.substring(0, 100)}...</p>
                                </div>
                                
                                


