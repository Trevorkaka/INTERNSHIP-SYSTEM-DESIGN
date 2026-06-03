export default function Card({ title, children }) {
    return(
        <div style={{ border: '1px solid #ddd', padding: "16px", borderRadius: "8px", marginBottom: "16px", background: '#fff' }}>
            {title && <h3>{title}</h3>}
            {children}
        </div>
    );
}