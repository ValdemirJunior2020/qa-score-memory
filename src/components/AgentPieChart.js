// src/components/AgentPieChart.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = [
  '#007bff', '#28a745', '#ffc107', '#dc3545',
  '#6610f2', '#20c997', '#fd7e14', '#6f42c1',
  '#17a2b8', '#e83e8c', '#6c757d', '#343a40'
];

function AgentPieChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'qa_scores'), (snapshot) => {
      const raw = snapshot.docs.map((doc) => doc.data());

      const tally = raw.reduce((acc, curr) => {
        acc[curr.agent] = (acc[curr.agent] || 0) + 1;
        return acc;
      }, {});

      const formatted = Object.entries(tally).map(([agent, count]) => ({
        name: agent,
        value: count
      }));

      setData(formatted);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <h5 className="mt-5">🥧 QA Evaluations per Agent</h5>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export default AgentPieChart;
