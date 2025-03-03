// components/HotelTag.tsx
import React from 'react';

// Define the available color options
type ColorOption = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray' | 'black' | 'white';

// Define the props interface
interface HotelTagProps {
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

const HotelTag: React.FC<HotelTagProps> = ({ name, color = 'blue' }) => {
    // Get the appropriate color class
    const colorClass = colorClasses[color];

    return (
        <span className={`inline-flex items-center justify-center px-3 py-1 text-lg font-medium rounded-lg m-1 shadow-sm ${colorClass}`}>
      {name}
    </span>
    );
};

export default HotelTag;