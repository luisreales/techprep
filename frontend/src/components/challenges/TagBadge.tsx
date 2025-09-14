import React from 'react';

interface TagBadgeProps {
  tag: string;
  color?: string;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ 
  tag, 
  color,
  className = '' 
}) => {
  // Default color styles if no custom color provided
  const defaultStyle = 'bg-blue-100 text-blue-800 border-blue-200';
  
  // If custom color is provided, use it with proper contrast
  const customStyle = color ? {
    backgroundColor: `${color}20`, // 20% opacity
    color: color,
    borderColor: `${color}40` // 40% opacity
  } : {};

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        color ? 'border' : defaultStyle
      } ${className}`}
      style={color ? customStyle : {}}
    >
      {tag}
    </span>
  );
};