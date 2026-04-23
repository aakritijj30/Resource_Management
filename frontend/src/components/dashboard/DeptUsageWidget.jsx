import LoadingSpinner from '../LoadingSpinner';
import { useDeptReport } from '../../hooks/useReports';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function DeptUsageWidget() {
  const { data: depts = [], isLoading } = useDeptReport();

  if (isLoading) {
    return (
      <div className="card flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="card p-6 bg-white border border-surface-200">
      <h3 className="font-bold text-surface-900 tracking-tight mb-6">Total Bookings by Department</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={depts} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="department_name" tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip 
            cursor={{ fill: '#F1F5F9' }} 
            contentStyle={{ background: '#ffffff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
            itemStyle={{ color: '#0F172A', fontWeight: 600 }}
            labelStyle={{ color: '#64748B', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}
          />
          <Bar dataKey="total_bookings" radius={[8, 8, 0, 0]} maxBarSize={60}>
            {depts.map((_, i) => <Cell key={i} fill={['#C06C84', '#F67280', '#F8B195'][ i % 3 ]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
