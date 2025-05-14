import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase/config';
import { collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Table, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ResultsPage() {
  const [entries, setEntries] = useState([]);
  const [, setUser] = useState(null); // ✅ ignore 'user', just keep setUser

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        navigate('/');
      }
    });

    const unsubscribeData = onSnapshot(collection(db, 'qa_scores'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, [navigate]);

  const originalGuidelines = [
    "Agent is ready - and available - to receive call",
    "Must open the conversation with correct introduction.",
    "Acknowledge Guests request, reiterating guests needs.",
    "Must confirm and provide all relevant information to the caller.",
    "Call Efficiency and Expectations",
    "Must explore and find all solutions/alternatives for caller's needs and issues.",
    "TELEPHONE TECHNIQUES: Must be professional throughout the conversation avoiding jargon/slang/abbreviations",
    "Must properly document notes.",
    "Must recap the customer of all relevant information and the possible outcomes of their request setting correct expectations."
  ];

  const isOriginal = (text) => originalGuidelines.includes(text);

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
            <th>QA Type</th>
            <th>Date</th>
            <th>Call Center</th>
            <th>Score</th>
            <th>Call ID</th>
            <th>Request ID</th>
            <th>Itinerary</th>
            <th>Call Length</th>
            <th>Notes</th>
            <th>Markdowns</th>
            <th>Submitted By</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.agent}</td>
              <td>
                <strong style={{ color: entry.qaType === 'Groups' ? 'blue' : 'green' }}>
                  {entry.qaType}
                </strong>
              </td>
              <td>{entry.date}</td>
              <td>{entry.center}</td>
              <td
                style={{
                  color:
                    (entry.qaType === 'CS' && entry.score >= 90) ||
                    (entry.qaType === 'Groups' && entry.score >= 85)
                      ? 'green'
                      : 'red',
                  fontWeight: 'bold'
                }}
              >
                {entry.score}
              </td>
              <td>{entry.callId}</td>
              <td>{entry.requestId}</td>
              <td>{entry.itinerary}</td>
              <td>{entry.callLength}</td>
              <td>{entry.notes}</td>
              <td>
                <ul className="mb-0">
                  {entry.markdowns?.map((md, i) => (
                    <li key={i} style={{ color: isOriginal(md) ? 'darkgreen' : 'darkblue' }}>
                      {md}
                    </li>
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
