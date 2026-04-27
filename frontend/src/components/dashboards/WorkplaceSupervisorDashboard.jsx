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
