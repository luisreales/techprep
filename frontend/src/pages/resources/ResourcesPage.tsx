import React, { useState } from 'react';
import { useTopicsQuery } from '@/hooks/useTopicsQuery';
import { useResourcesQuery } from '@/hooks/useResourcesQuery';
import { ResourceItem } from './ResourceItem';

export const ResourcesPage: React.FC = () => {
  const { data: topics = [] } = useTopicsQuery();
  const [topicId, setTopicId] = useState<number | undefined>();
  const { data: resources = [], isLoading } = useResourcesQuery(topicId ? { topicId } : undefined);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl">Resources</h2>
      <select
        className="border p-1"
        value={topicId ?? ''}
        onChange={(e) => setTopicId(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">All topics</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {isLoading ? (
        <p>Loading...</p>
      ) : resources.length ? (
        <ul className="space-y-2">
          {resources.map((r) => (
            <ResourceItem key={r.id} resource={r} />
          ))}
        </ul>
      ) : (
        <p>No resources found</p>
      )}
    </div>
  );
};
