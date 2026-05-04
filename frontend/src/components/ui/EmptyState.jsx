import Button from './Button';

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon || '🔍'}</div>
      <h3 className="section-title mb-2">{title}</h3>
      {description && <p className="text-muted text-sm max-w-sm mb-6">{description}</p>}
      {action && <Button onClick={action}>{actionLabel || 'Get Started'}</Button>}
    </div>
  );
}
