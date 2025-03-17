// components/HotelTag.tsx
import React from 'react';

// Define the available color options
type ColorOption = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray' | 'black' | 'white';

// Define the props interface
interface TagProps {
    name: string;
    color?: ColorOption;
}

// Color mapping with TypeScript
const colorClasses: Record<ColorOption, string> = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-400 text-black',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    gray: 'bg-gray-500 text-white',
    black: 'bg-black text-white',
    white: 'bg-white text-black border border-gray-200',
};

const Tag: React.FC<TagProps> = (
    { name, color = 'blue', className }:
        {name: string, color?: string, className?: string}
) => {
    // Get the appropriate color class
    const colorClass = colorClasses[color];

    return (
        <span className={`inline-flex items-center justify-center px-3 py-1 text-lg font-medium rounded-lg m-1 shadow-sm max-w-fit ${colorClass} ${className}`}>
      {name}
    </span>
    );
};

export default Tag;