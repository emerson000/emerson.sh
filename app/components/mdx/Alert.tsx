import { ReactNode } from 'react';

type AlertProps = {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: ReactNode;
};

export function Alert({ type = 'info', title, children }: AlertProps) {
  const colors = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    success: 'bg-green-50 text-green-800 border-green-200',
  };

  return (
    <div className={`p-4 mt-0 mb-4 rounded-lg border ${colors[type]}`}>
      {title && <b className="font-bold p-0 m-0">{type == 'warning' ? '⚠️' : type == 'error' ? '❌' : type == 'success' ? '✅' : 'ℹ️'} {title}</b>}
      {children}
    </div>
  );
} 