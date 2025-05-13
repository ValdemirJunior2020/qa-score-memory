// src/components/ScoreChart.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts';

function ScoreChart() {
  const [centerData, setCenterData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'qa_scores'), (snapshot) => {
      const raw = snapshot.docs.map((doc) => doc.data());
      const tally = raw.reduce((acc, curr) => {
        acc[curr.center] = (acc[curr.center] || 0) + 1;
        return acc;
      }, {});

      const formatted = Object.entries(tally).map(([center, count]) => ({
        center,
        count
      }));

      setCenterData(formatted);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <h5 className="mt-5">📊 QA Count by Call Center</h5>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={centerData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="center" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default ScoreChart;
