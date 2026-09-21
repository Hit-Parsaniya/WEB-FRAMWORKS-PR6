import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const data = [
  { name: 'Mon', completed: 4, pending: 2 },
  { name: 'Tue', completed: 7, pending: 3 },
  { name: 'Wed', completed: 5, pending: 1 },
  { name: 'Thu', completed: 8, pending: 4 },
  { name: 'Fri', completed: 6, pending: 2 },
  { name: 'Sat', completed: 3, pending: 0 },
  { name: 'Sun', completed: 2, pending: 1 }
];

export default function HeavyChart() {
  return (
    <div className="chart-wrapper" style={{ width: '100%', height: 350, marginTop: '20px' }}>
      <h3>Weekly Task Completion Overview (Powered by Recharts)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" fill="#4f46e5" name="Completed Tasks" />
          <Bar dataKey="pending" fill="#f59e0b" name="Pending Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
