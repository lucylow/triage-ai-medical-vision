import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-grey-600">Test Page</h1>
      <p className="text-lg mt-4">If you can see this, React is working!</p>
      <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded">
        <p className="text-green-800">✅ React is rendering successfully</p>
      </div>
    </div>
  );
};

export default TestPage;
