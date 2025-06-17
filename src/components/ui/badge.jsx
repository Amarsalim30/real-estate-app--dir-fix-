import React from 'react';
import { cn } from '@/utils/cn';

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none',
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
        className
      )}
      {...props}
    />
  );
}
