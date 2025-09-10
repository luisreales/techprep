import React from 'react';
import type { Resource } from '@/types';

interface Props {
  resource: Resource;
}

export const ResourceItem: React.FC<Props> = ({ resource }) => (
  <li className="p-2 border rounded">
    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
      {resource.title}
    </a>
  </li>
);
