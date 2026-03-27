import React from 'react';
import { useAuth } from '../AuthContext';
import ui from '../../translations/ui';

const LibraryContent = ({ content }) => {
  const { language } = useAuth();
  const commonT = (ui[language] || ui.en).common;
  const contentData = {
    title: "Test Title",
    author: "Test Author",
    description: "Test Description",
    date: "2024-01-01",
    category: ["Test Category"]
  };

  return (
    <div className="w-full md:w-3/4 px-4 mb-8">
      <div className="mb-4">
        {contentData.category.map((c, index) => (
          <span key={index} className="inline-block py-1 px-3 text-xs bg-green-100 rounded-full mr-5">
            {c}
          </span>
        ))}
      </div>

      <h3 className="text-3xl font-bold mb-2">
        {contentData.title}
      </h3>

      <p className="mb-4 text-base italic">
        {contentData.author}
      </p>

      <p className="mb-4 text-base text-gray-600">
        {contentData.description}
      </p>

      <p className="text-sm text-gray-500">
        {commonT.published} {contentData.date}
      </p>
    </div>
  );
};

export default LibraryContent;
