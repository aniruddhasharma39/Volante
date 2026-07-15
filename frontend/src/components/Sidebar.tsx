import React from 'react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Payment Explorer', href: '/explorer' },
  { name: 'Report Builder', href: '/builder' },
  { name: 'Report Center', href: '/reports' },
  { name: 'Scheduler', href: '/scheduler' },
  { name: 'Data Sources', href: '/data-sources' },
  { name: 'Schema Registry', href: '/schema-registry' },
  { name: 'Alerts', href: '/alerts' },
  { name: 'Administration', href: '/admin' },
];

export const Sidebar = () => {
  return (
    <div className="flex flex-col w-64 bg-gray-800 min-h-screen">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
