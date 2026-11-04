export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <h2 className="h4">{title}</h2>
      <p className="text-secondary mb-3">{message}</p>
      {action}
    </div>
  );
}
