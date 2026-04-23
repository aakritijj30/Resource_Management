import { motion } from 'framer-motion';
import { FileText, MoreVertical } from 'lucide-react';

export default function ProjectsTable({ projects = [] }) {
  
  if (projects.length === 0) {
    projects = [
      { id: '1', name: 'Alpha Q3 Deliverables', status: 'In Progress', deadline: 'Oct 24', owner: 'Dev Team' },
      { id: '2', name: 'Website Redesign', status: 'At Risk', deadline: 'Oct 31', owner: 'Design' },
      { id: '3', name: 'Backend Migration', status: 'Completed', deadline: 'Sep 15', owner: 'Infrastructure' },
      { id: '4', name: 'Client App Portal', status: 'In Progress', deadline: 'Nov 12', owner: 'Contractors' },
    ];
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'At Risk': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-surface-100 text-surface-800 border-surface-200';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card flex flex-col"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <FileText size={16} />
          </div>
          <h2 className="text-lg font-bold text-surface-900">Projects Overview</h2>
        </div>
        <button className="text-surface-400 hover:text-surface-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-surface-600">
          <thead className="border-b border-surface-100 text-xs uppercase text-surface-400">
            <tr>
              <th className="py-3 px-4 font-semibold">Project Name</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Deadline</th>
              <th className="py-3 px-4 font-semibold">Owner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50">
            {projects.map((project, idx) => (
              <motion.tr 
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="hover:bg-surface-50 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-surface-900">{project.name}</td>
                <td className="py-4 px-4">
                  <span className={`badge ${getStatusStyle(project.status)}`}>
                    {project.status}
                  </span>
                </td>
                <td className="py-4 px-4">{project.deadline}</td>
                <td className="py-4 px-4">{project.owner}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
