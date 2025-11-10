import React from 'react';
import Card from '../components/common/Card';

const Resources = () => {
  const resources = [
    {
      category: 'Learning Platforms',
      items: [
        {
          name: 'Platzi',
          description: 'Online education platform with courses in technology, design, and business.',
          url: 'https://platzi.com',
          icon: '🎓',
        },
        {
          name: 'Coursera',
          description: 'Online learning platform offering courses from top universities and companies.',
          url: 'https://coursera.org',
          icon: '📚',
        },
        {
          name: 'edX',
          description: 'Online learning platform founded by Harvard and MIT.',
          url: 'https://edx.org',
          icon: '🎓',
        },
        {
          name: 'Udemy',
          description: 'Online learning marketplace with courses on various topics.',
          url: 'https://udemy.com',
          icon: '💻',
        },
      ],
    },
    {
      category: 'Programming Resources',
      items: [
        {
          name: 'MDN Web Docs',
          description: 'Comprehensive documentation for web technologies.',
          url: 'https://developer.mozilla.org',
          icon: '🌐',
        },
        {
          name: 'React Documentation',
          description: 'Official documentation for React.js framework.',
          url: 'https://react.dev',
          icon: '⚛️',
        },
        {
          name: 'Laravel Documentation',
          description: 'Official documentation for Laravel PHP framework.',
          url: 'https://laravel.com/docs',
          icon: '🐘',
        },
        {
          name: 'GitHub',
          description: 'Platform for version control and collaboration.',
          url: 'https://github.com',
          icon: '📦',
        },
      ],
    },
    {
      category: 'Design & UX',
      items: [
        {
          name: 'Figma',
          description: 'Collaborative interface design tool.',
          url: 'https://figma.com',
          icon: '🎨',
        },
        {
          name: 'Dribbble',
          description: 'Showcase of creative work from designers worldwide.',
          url: 'https://dribbble.com',
          icon: '💎',
        },
        {
          name: 'Material Design',
          description: 'Google\'s design system and guidelines.',
          url: 'https://material.io/design',
          icon: '📱',
        },
        {
          name: 'Tailwind CSS',
          description: 'Utility-first CSS framework for rapid UI development.',
          url: 'https://tailwindcss.com',
          icon: '🎨',
        },
      ],
    },
    {
      category: 'Career Development',
      items: [
        {
          name: 'LinkedIn',
          description: 'Professional networking platform.',
          url: 'https://linkedin.com',
          icon: '💼',
        },
        {
          name: 'Stack Overflow',
          description: 'Q&A platform for developers.',
          url: 'https://stackoverflow.com',
          icon: '❓',
        },
        {
          name: 'Dev.to',
          description: 'Community of software developers sharing knowledge.',
          url: 'https://dev.to',
          icon: '👥',
        },
        {
          name: 'HackerRank',
          description: 'Platform for coding challenges and skill assessment.',
          url: 'https://hackerrank.com',
          icon: '🏆',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Discover valuable resources to enhance your skills and advance your career in technology and design.
          These platforms offer courses, documentation, and communities to support your learning journey.
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <Card.Header>
              <Card.Title className="text-xl">{category.category}</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {category.items.map((resource, resourceIndex) => (
                  <a
                    key={resourceIndex}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-soft transition-all duration-200 group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">{resource.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {resource.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        <div className="flex items-center mt-2 text-xs text-primary-600 group-hover:text-primary-700">
                          <span>Visit website</span>
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-primary text-white">
        <Card.Content className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Start Your Learning Journey</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Continuous learning is key to success in the technology industry. Explore these resources
            to build new skills, stay updated with industry trends, and connect with like-minded professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://platzi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              Explore Platzi Courses
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white bg-transparent hover:bg-white hover:text-blue-600 transition-colors"
            >
              Explore Open Source
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </Card.Content>
      </Card>

      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500">
        <p>
          These resources are recommended to support your professional development.
          Remember to balance learning with practical application and real-world projects.
        </p>
      </div>
    </div>
  );
};

export default Resources;