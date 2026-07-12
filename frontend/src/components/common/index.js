// Export common UI components like buttons, modals, or cards used across the app
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white shadow rounded p-4 ${className}`}>
    {children}
  </div>
);