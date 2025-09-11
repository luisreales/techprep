import React from 'react';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

interface ResourceSection {
  title: string;
  items: ResourceItem[];
}

const Resources: React.FC = () => {
  const resourceSections: ResourceSection[] = [
    {
      title: "Data Structures",
      items: [
        {
          id: "arrays",
          title: "Arrays and Linked Lists",
          description: "Learn about arrays, linked lists, stacks, and queues.",
          icon: "data_array",
          href: "#"
        },
        {
          id: "trees",
          title: "Trees",
          description: "Explore tree structures, binary trees, and tree traversal algorithms.",
          icon: "account_tree",
          href: "#"
        },
        {
          id: "hash-tables",
          title: "Hash Tables",
          description: "Understand hash tables, hash functions, and collision resolution.",
          icon: "tag",
          href: "#"
        }
      ]
    },
    {
      title: "Algorithms",
      items: [
        {
          id: "sorting",
          title: "Sorting Algorithms",
          description: "Master sorting algorithms like quicksort, mergesort, and heapsort.",
          icon: "sort",
          href: "#"
        },
        {
          id: "search",
          title: "Search Algorithms",
          description: "Learn about search algorithms like binary search and depth-first search.",
          icon: "search",
          href: "#"
        },
        {
          id: "dp",
          title: "Dynamic Programming",
          description: "Explore dynamic programming techniques and common DP problems.",
          icon: "extension",
          href: "#"
        }
      ]
    },
    {
      title: "System Design",
      items: [
        {
          id: "scalability",
          title: "Scalability and Load Balancing",
          description: "Understand concepts like scalability, load balancing, and caching.",
          icon: "scale",
          href: "#"
        },
        {
          id: "database",
          title: "Database Design",
          description: "Learn about database design, indexing, and query optimization.",
          icon: "database",
          href: "#"
        },
        {
          id: "api",
          title: "API Design",
          description: "Explore API design principles and RESTful APIs.",
          icon: "api",
          href: "#"
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
        {resourceSections.map((section) => (
          <div key={section.title} className="bg-[var(--card-background)] rounded-xl shadow-sm p-6">
            <h2 className="text-[var(--text-primary)] text-2xl font-bold leading-tight tracking-tight mb-4">
              {section.title}
            </h2>
            <div className="space-y-3">
                {section.items.map((item) => (
                  <a
                    key={item.id}
                    className="flex items-center gap-4 bg-[var(--card-background)] p-4 rounded-lg border border-[var(--border-color)] hover:shadow-md transition-shadow"
                    href={item.href}
                  >
                    <div className="text-[var(--primary-color)] flex items-center justify-center rounded-lg bg-[var(--primary-color-light)] shrink-0 w-12 h-12">
                      <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-[var(--text-primary)] text-base font-semibold leading-normal">
                        {item.title}
                      </p>
                      <p className="text-[var(--text-secondary)] text-sm font-normal leading-normal">
                        {item.description}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[var(--text-secondary)]">chevron_right</span>
                  </a>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Resources;