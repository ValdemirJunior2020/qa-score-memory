// src/App.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Login from './components/Login';
import QAForm from './components/QAForm';
import ScoreTable from './components/ScoreTable';
import ScoreChart from './components/ScoreChart';
import AgentPieChart from './components/AgentPieChart';

function App() {
  const navigate = useNavigate();

  // Persist login with localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('qa-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('qa-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('qa-user');
    }
  }, [user]);

  return (
    <Container className="py-5">
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <>
          <Row className="mb-4">
            <Col>
              <h1 className="text-center">QA Calibration Dashboard</h1>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col className="text-end">
              <Button variant="secondary" onClick={() => navigate('/results')}>
                📄 View All QA Results
              </Button>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={{ span: 8, offset: 2 }}>
              <div className="qa-wrapper">
                <QAForm user={user} />
              </div>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col>
              <div className="qa-wrapper">
                <ScoreTable user={user} />
              </div>
            </Col>
          </Row>

          <Row className="mb-5">
            <Col>
              <div className="qa-wrapper">
                <ScoreChart />
              </div>
            </Col>
          </Row>

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
