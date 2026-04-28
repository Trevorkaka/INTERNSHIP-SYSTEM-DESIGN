export default function List({ items, renderItem }) {
    return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((it) => (
        <li key={it.id} style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>
          {renderItem(it)}
        </li>
      ))}
    </ul>
  )
}