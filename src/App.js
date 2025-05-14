// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import Login from './components/Login';
import QAForm from './components/QAForm';
import ScoreTable from './components/ScoreTable';
import ScoreChart from './components/ScoreChart';
import AgentPieChart from './components/AgentPieChart';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ✅ Firebase handles session automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Container className="py-5">
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <>
          {/* Header */}
          <Row className="mb-4">
            <Col>
              <h1 className="text-center">QA Calibration Dashboard</h1>
            </Col>
          </Row>

          {/* View All Results Button */}
          <Row className="mb-3">
            <Col className="text-end">
              <Button variant="secondary" onClick={() => navigate('/results')}>
                📄 View All QA Results
              </Button>
            </Col>
          </Row>

          {/* QA Form Centered */}
          <Row className="mb-4">
            <Col md={{ span: 8, offset: 2 }}>
              <div className="qa-wrapper">
                <QAForm user={user} />
              </div>
            </Col>
          </Row>

          {/* QA Table */}
          <Row className="mb-5">
            <Col>
              <div className="qa-wrapper">
                <ScoreTable user={user} />
              </div>
            </Col>
          </Row>

          {/* Bar Chart */}
          <Row className="mb-5">
            <Col>
              <div className="qa-wrapper">
                <ScoreChart />
              </div>
            </Col>
          </Row>

          {/* Pie Chart */}
          <Row>
            <Col>
              <div className="qa-wrapper">
                <AgentPieChart />
              </div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default App;
