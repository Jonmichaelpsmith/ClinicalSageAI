import React from 'react';
import { Link } from 'wouter';

export default function Breadcrumbs({ items = [] }) {
  return (
    <div className="px-4 py-2 text-sm text-gray-600 font-medium bg-white border-b">
      {items.map((item, idx) => (
        <span key={idx}>
          {idx > 0 && ' > '}
          {item.to ? (
            <Link href={item.to} className="hover:text-indigo-600 hover:underline transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}