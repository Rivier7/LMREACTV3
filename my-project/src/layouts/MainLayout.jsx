import React from 'react';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  return (
    <div>
      <Header />
      <main className="m-4">
        {children} {/* Page-specific content */}
      </main>
    </div>
  );
};

export default MainLayout;
