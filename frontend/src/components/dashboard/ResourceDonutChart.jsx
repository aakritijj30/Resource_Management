import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, MoreVertical } from 'lucide-react';

export default function ResourceDonutChart({ data = [] }) {

  if (data.length === 0) {
    data = [
      { name: 'Hardware', value: 400, color: '#c06c84' },
      { name: 'Software Libs', value: 300, color: '#e098ae' },
      { name: 'Meeting Rooms', value: 300, color: '#ecc5d0' },
      { name: 'Cloud VMs', value: 200, color: '#733748' },
    ];
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card flex flex-col h-full min-h-[360px]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <PieChartIcon size={16} />
          </div>
          <h2 className="text-lg font-bold text-surface-900">Allocation</h2>
        </div>
        <button className="text-surface-400 hover:text-surface-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="flex-1 w-full h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              animationBegin={400}
              animationDuration={1200}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              itemStyle={{ color: '#341720', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-3xl font-display font-bold text-surface-900">
            {data.reduce((acc, curr) => acc + curr.value, 0)}
          </span>
          <span className="text-xs uppercase tracking-widest text-surface-400 font-semibold mt-1">Total</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-surface-600 font-medium truncate" title={item.name}>{item.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
