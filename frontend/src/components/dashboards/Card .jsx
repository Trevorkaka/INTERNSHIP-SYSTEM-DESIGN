export default function Card({ title, children }) {
    return(
        <div style={{ border: '1px solid #e2e8f0', padding: 16, borderRadius: 8, background: '#fff' }}>
            <h3 style={{ marginTop: 0 }}>{title}</h3>
            <div>{children}</div>
        </div>
    )
}