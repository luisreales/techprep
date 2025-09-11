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
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="flex flex-col min-h-screen justify-between">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center p-4">
            <button className="text-gray-700">
              <span className="material-symbols-outlined">
                arrow_back
              </span>
            </button>
            <h1 className="text-gray-900 text-xl font-bold flex-1 text-center pr-8">Resources</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4 space-y-6">
          {resourceSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-gray-900 text-2xl font-bold leading-tight tracking-tight mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <a
                    key={item.id}
                    className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    href={item.href}
                  >
                    <div className="text-[#137fec] flex items-center justify-center rounded-lg bg-blue-100 shrink-0 w-12 h-12">
                      <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-900 text-base font-semibold leading-normal">
                        {item.title}
                      </p>
                      <p className="text-gray-500 text-sm font-normal leading-normal">
                        {item.description}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </main>

        {/* Bottom Navigation */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-200">
          <nav className="flex justify-around p-2">
            <a className="flex flex-col items-center justify-end gap-1 text-gray-500" href="#">
              <span className="material-symbols-outlined">home</span>
              <p className="text-xs font-medium">Home</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-gray-500" href="#">
              <span className="material-symbols-outlined">code</span>
              <p className="text-xs font-medium">Practice</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-[#137fec]" href="#">
              <span className="material-symbols-outlined">collections_bookmark</span>
              <p className="text-xs font-bold">Resources</p>
            </a>
            <a className="flex flex-col items-center justify-end gap-1 text-gray-500" href="#">
              <span className="material-symbols-outlined">person</span>
              <p className="text-xs font-medium">Profile</p>
            </a>
          </nav>
        </footer>
      </div>
    </div>
  );
};

export default Resources;