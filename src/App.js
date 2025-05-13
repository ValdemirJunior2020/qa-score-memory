// src/App.js
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Login from './components/Login';
import QAForm from './components/QAForm';
import ScoreTable from './components/ScoreTable';
import ScoreChart from './components/ScoreChart';
import AgentPieChart from './components/AgentPieChart';
import { useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  return (
    <Container className="py-5">
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <>
          {/* Title */}
          <Row className="mb-4">
            <Col>
              <h1 className="text-center">QA Calibration Dashboard</h1>
            </Col>
          </Row>

          {/* View Results Button */}
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
              <QAForm user={user} />
            </Col>
          </Row>

          {/* QA Table */}
          <Row>
            <Col>
              <ScoreTable user={user} />
            </Col>
          </Row>

          {/* Bar Chart */}
          <Row>
            <Col>
              <ScoreChart />
            </Col>
          </Row>

          {/* Pie Chart */}
          <Row>
            <Col>
              <AgentPieChart />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default App;
