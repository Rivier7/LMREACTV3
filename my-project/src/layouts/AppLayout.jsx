import { useState, createContext, useContext } from 'react';
import Sidebar from '../components/Sidebar';

// Context to share sidebar state with child components if needed
const SidebarContext = createContext({ collapsed: false, setCollapsed: () => {} });

export const useSidebar = () => useContext(SidebarContext);

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Main content area - offset by sidebar width */}
        <main
          className={`transition-all duration-300 min-h-screen ${
            collapsed ? 'ml-[72px]' : 'ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

export default AppLayout;
