// src/ResultsPage.js
import React, { useEffect, useState } from 'react';
import { db } from './firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { Table, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ResultsPage() {
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'qa_scores'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">All QA Results</h2>
      <Button variant="secondary" className="mb-3" onClick={() => navigate('/')}>
        🔙 Back to Dashboard
      </Button>
      <Table striped bordered responsive>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Date</th>
            <th>Call Center</th>
            <th>Score</th>
            <th>Markdowns</th>
            <th>Submitted By</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.agent}</td>
              <td>{entry.date}</td>
              <td>{entry.center}</td>
              <td style={{ color: entry.score >= 90 ? 'green' : 'red', fontWeight: 'bold' }}>
                {entry.score}
              </td>
              <td>
                <ul className="mb-0">
                  {entry.markdowns?.map((md, i) => (
                    <li key={i}>{md}</li>
                  ))}
                </ul>
              </td>
              <td>{entry.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ResultsPage;
