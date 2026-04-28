import { createContext, useContext, useState, useEffect } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  // Persist some common filters across the app
  const [departmentId, setDepartmentId] = useState(() => {
    const saved = localStorage.getItem('global_dept_filter');
    return saved ? (saved === 'all' || saved === 'common' ? saved : parseInt(saved)) : 'all';
  });

  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem('global_status_filter');
    return saved || 'all';
  });

  useEffect(() => {
    localStorage.setItem('global_dept_filter', departmentId);
  }, [departmentId]);

  useEffect(() => {
    localStorage.setItem('global_status_filter', statusFilter);
  }, [statusFilter]);

  return (
    <FilterContext.Provider value={{ 
      departmentId, setDepartmentId, 
      statusFilter, setStatusFilter 
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useGlobalFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
}
