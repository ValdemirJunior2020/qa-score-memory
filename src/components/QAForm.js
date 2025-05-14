// src/components/QAForm.js
import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Form, Button, Alert } from 'react-bootstrap';

// Existing (CS) Guidelines – GREEN
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

// New GROUP Guidelines – BLUE
const groupGuidelines = [
  "Agent begins speaking within 3-5 seconds of being connected to the call. Meaning: Once dial tune has ended if present.",
  "Agent took more than 3 seconds to answer OR began prior to dial tone ending.",
  "Agent answers using, \"Thank you for calling Hotel Reservations. My name is..., how may I assist you?\"",
  "Agent provides a different name or alias.",
  "Agent shows understanding of guest's reason for calling. (block, individual, extended stay)",
  "Agent does not display understanding of guest's request.",
  "Agent captures all requested info and inserts into correct location using phonetics.",
  "Agent enters incomplete info or wrong location, avoids TA section.",
  "Guest did not require group RFP (Request For Proposal)",
  "Agent answers with correct verbiage or honest answer from training manual.",
  "Agent provides incorrect info about hotel, area, or process.",
  "Agent displays ownership by leading questions and completing RFP.",
  "Uncertain or low-confidence behavior.",
  "Agent must be professional throughout: avoid slang, dead air, poor vocab.",
  "Agent misunderstands guest, blames phone, asks irrelevant questions, engages in small-talk.",
  "Agent recaps essential details and confirms accuracy with clear next steps before ending call.",
  "Process not followed correctly"
];

function QAForm({ user }) {
  const [agent, setAgent] = useState('');
  const [qaType, setQaType] = useState('CS');
  const [date, setDate] = useState('');
  const [center, setCenter] = useState('');
  const [score, setScore] = useState('');
  const [markdowns, setMarkdowns] = useState([]);
  const [callId, setCallId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [callLength, setCallLength] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'qa_scores'), {
        agent,
        qaType,
        date,
        center,
        score: Number(score),
        markdowns,
        callId,
        requestId,
        itinerary,
        callLength,
        notes,
        createdBy: user.email,
        timestamp: serverTimestamp()
      });

      setSuccess('Saved successfully!');
      setAgent('');
      setQaType('CS');
      setDate('');
      setCenter('');
      setScore('');
      setMarkdowns([]);
      setCallId('');
      setRequestId('');
      setItinerary('');
      setCallLength('');
      setNotes('');

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

  const renderCheckbox = (guideline, color) => (
    <Form.Check
      key={guideline}
      type="checkbox"
      label={<span style={{ color }}>{guideline}</span>}
      checked={markdowns.includes(guideline)}
      onChange={() => handleMarkdownChange(guideline)}
    />
  );

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
        <Form.Label>QA Type</Form.Label>
        <Form.Select value={qaType} onChange={(e) => setQaType(e.target.value)} required>
          <option value="CS">CS</option>
          <option value="Groups">Groups</option>
        </Form.Select>
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
          <option value="Teleperformance">Teleperformance</option>
          <option value="Buwelo">Buwelo</option>
          <option value="WNS">WNS</option>
          <option value="Concentrix">Concentrix</option>
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
        <Form.Label>Call ID#</Form.Label>
        <Form.Control
          type="text"
          value={callId}
          onChange={(e) => setCallId(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Request ID</Form.Label>
        <Form.Control
          type="text"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Itinerary</Form.Label>
        <Form.Control
          type="text"
          value={itinerary}
          onChange={(e) => setItinerary(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Call Length</Form.Label>
        <Form.Control
          type="text"
          value={callLength}
          placeholder="e.g. 5:45"
          onChange={(e) => setCallLength(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Notes</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Guidelines Marked Down</Form.Label>
        <div className="mb-2"><strong>CS (Green)</strong></div>
        {originalGuidelines.map(g => renderCheckbox(g, 'darkgreen'))}
        <div className="mt-3 mb-2"><strong>Groups (Blue)</strong></div>
        {groupGuidelines.map(g => renderCheckbox(g, 'darkblue'))}
      </Form.Group>

      <Button type="submit" variant="primary">
        Save QA Result
      </Button>
    </Form>
  );
}

export default QAForm;
