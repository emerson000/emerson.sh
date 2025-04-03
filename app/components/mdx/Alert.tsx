import { ReactNode } from 'react';

type AlertProps = {
  type?: 'info' | 'warning' | 'error' | 'success';
  children: ReactNode;
};

export function Alert({ type = 'info', children }: AlertProps) {
  const colors = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
  };

  return (
    <div className={`p-4 mb-4 rounded-lg border ${colors[type]}`}>
      {children}
    </div>
  );
} 