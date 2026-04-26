import { use, useEffect } from "react";
import api from './Api';
import card from './Card';
import list from './List';

export default function StudentDashboard() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                const res = await api.get('/students/')
                if (mounted) setStudents(res.data)
                } catch (err) {
                    console.error(err);
                } finally {
                    if (mounted) setStudents(res.data);