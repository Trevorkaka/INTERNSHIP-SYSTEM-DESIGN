import { useState, useEffect } from "react";
import api from '../../utils/api';
import Card from '../Card';
import List from '../List';

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
                    if (mounted) setLoading(false);
                }
            }
            load()
            return () => (mounted = false);
        }, [])

        return (
            <div style = {{display: 'grid',gap:12}}>
                <card title = {`Students (${students.length})`}>
                    {loading ? (
                        <div>Loading...</div>
                    ) : students.length === 0 ? (
                        <div>No students</div>
                    ) : (
                        <list
                            items = {students}
                            renderItem = {(s) => (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{s.user?.username}</strong>
                  <div style={{ fontSize: 12, color: '#475569' }}>{s.user?.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>{s.course}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{s.registration_number}</div>
                </div>
              </div>
            )}
          />
        )}
      </card>
    </div>
  )
}