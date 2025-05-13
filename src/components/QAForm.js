// src/components/QAForm.js
import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Form, Button, Alert } from 'react-bootstrap';

const guidelineOptions = [
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

const callCenters = {
  Tuesday: 'Teleperformance',
  Wednesday: 'Buwelo',
  Thursday: 'WNS',
  Friday: 'Concentrix'
};

function QAForm({ user }) {
  const [agent, setAgent] = useState('');
  const [date, setDate] = useState('');
  const [center, setCenter] = useState('');
  const [score, setScore] = useState('');
  const [markdowns, setMarkdowns] = useState([]);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'qa_scores'), {
        agent,
        date,
        center,
        score: Number(score),
        markdowns,
        createdBy: user.email,
        timestamp: serverTimestamp()
      });
      setSuccess('Saved successfully!');
      setAgent('');
      setDate('');
      setCenter('');
      setScore('');
      setMarkdowns([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Error saving QA:", err);
    }
  };

  const handleMarkdownChange = (guideline) => {
    setMarkdowns((prev) =>
      prev.includes(guideline)
        ? prev.filter((item) => item !== guideline)
        : [...prev, guideline]
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      <h3 className="mb-4">Submit QA Evaluation</h3>
      {success && <Alert variant="success">{success}</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Agent Name</Form.Label>
        <Form.Control
          type="text"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Date of QA</Form.Label>
        <Form.Control
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Call Center</Form.Label>
        <Form.Select
          value={center}
          onChange={(e) => setCenter(e.target.value)}
          required
        >
          <option value="">Select</option>
          {Object.values(callCenters).map((center) => (
            <option key={center} value={center}>
              {center}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Final Score</Form.Label>
        <Form.Control
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Guidelines Marked Down</Form.Label>
        {guidelineOptions.map((item) => (
          <Form.Check
            key={item}
            type="checkbox"
            label={item}
            checked={markdowns.includes(item)}
            onChange={() => handleMarkdownChange(item)}
          />
        ))}
      </Form.Group>

      <Button type="submit" variant="primary">
        Save QA Result
      </Button>
    </Form>
  );
}

export default QAForm;
