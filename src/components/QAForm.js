import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Form, Button, Alert, Table } from 'react-bootstrap';

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
  const [markdownSelections, setMarkdownSelections] = useState({});
  const [callId, setCallId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [callLength, setCallLength] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [recentFailures, setRecentFailures] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'qa_scores'), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.markdowns && item.markdowns.length > 0)
        .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
        .slice(0, 5);
      setRecentFailures(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const markdowns = Object.entries(markdownSelections)
      .filter(([_, value]) => value === 'No')
      .map(([guideline]) => guideline);

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
      setMarkdownSelections({});
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

  const handleSelectChange = (guideline, value) => {
    setMarkdownSelections(prev => ({ ...prev, [guideline]: value }));
  };

  const renderGuidelineDropdown = (guideline, color) => {
    const selected = markdownSelections[guideline] || '';
    const style = selected === 'Yes' ? { color: 'green' } : selected === 'No' ? { color: 'red' } : {};

    return (
      <Form.Group key={guideline} className="mb-2">
        <Form.Label style={{ color }}>{guideline}</Form.Label>
        <Form.Select
          value={selected}
          onChange={(e) => handleSelectChange(guideline, e.target.value)}
          style={style}
        >
          <option value="">Select...</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </Form.Select>
      </Form.Group>
    );
  };

  return (
    <>
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
          <Form.Select value={center} onChange={(e) => setCenter(e.target.value)} required>
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

        <h5 className="mt-4 mb-2" style={{ color: 'darkgreen' }}>CS Guidelines</h5>
        {originalGuidelines.map(g => renderGuidelineDropdown(g, 'darkgreen'))}

        <h5 className="mt-4 mb-2" style={{ color: 'darkblue' }}>Groups Guidelines</h5>
        {groupGuidelines.map(g => renderGuidelineDropdown(g, 'darkblue'))}

        <Button type="submit" variant="primary" className="mt-4">
          Save QA Result
        </Button>
      </Form>

      <hr className="my-5" />

      <h4>Recent QA Entries with Markdowns</h4>
      <Table striped bordered responsive>
        <thead>
          <tr>
            <th>Agent</th>
            <th>QA Type</th>
            <th>Date</th>
            <th>Score</th>
            <th>Center</th>
            <th>By</th>
            <th>Markdowns</th>
          </tr>
        </thead>
        <tbody>
          {recentFailures.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.agent}</td>
              <td>{entry.qaType}</td>
              <td>{entry.date}</td>
              <td style={{ color: (entry.qaType === 'CS' && entry.score >= 90) || (entry.qaType === 'Groups' && entry.score >= 85) ? 'green' : 'red', fontWeight: 'bold' }}>{entry.score}</td>
              <td>{entry.center}</td>
              <td>{entry.createdBy}</td>
              <td>
                <ul className="mb-0">
                  {entry.markdowns.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default QAForm;
