'use client';

import React, { ReactNode } from 'react';

interface SettingCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  status?: 'active' | 'inactive' | 'warning';
  statusText?: string;
  children: ReactNode;
  iconGradient?: string;
}

function SettingCard({
  icon,
  title,
  description,
  status = 'active',
  statusText,
  children,
  iconGradient = 'from-blue-500 to-blue-600'
}: SettingCardProps) {
  const statusStyles = {
    active: 'text-green-700 bg-green-50',
    inactive: 'text-gray-700 bg-gray-50',
    warning: 'text-amber-700 bg-amber-50',
  };

  const defaultStatusText = {
    active: '활성',
    inactive: '비활성',
    warning: '주의',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
      <div className="p-6">
        <div className="flex items-start gap-4">

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[status]}`}>
                {statusText || defaultStatusText[status]}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {description}
            </p>
            
            {/* Children Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingCard;