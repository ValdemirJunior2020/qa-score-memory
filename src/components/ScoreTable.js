import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import {
  Table,
  Form,
  Button,
  Modal,
  Alert
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

function ScoreTable({ user }) {
  const [entries, setEntries] = useState([]);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editEntry, setEditEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'qa_scores'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    return (
      (filterAgent ? entry.agent.toLowerCase().includes(filterAgent.toLowerCase()) : true) &&
      (filterCenter ? entry.center === filterCenter : true) &&
      (filterDate ? entry.date === filterDate : true) &&
      (filterType ? entry.qaType === filterType : true)
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteDoc(doc(db, 'qa_scores', id));
      setMessage('Entry deleted successfully!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const openEditModal = (entry) => {
    setEditEntry({ ...entry });
    setShowModal(true);
  };

  const handleEditChange = (field, value) => {
    setEditEntry({ ...editEntry, [field]: value });
  };

  const saveEdit = async () => {
    const ref = doc(db, 'qa_scores', editEntry.id);
    const { id, ...updateData } = editEntry;
    await updateDoc(ref, updateData);
    setMessage('Entry updated successfully!');
    setShowModal(false);
    setTimeout(() => setMessage(''), 2000);
  };

  const exportToXLSX = () => {
    const exportData = filteredEntries.map(entry => ({
      Agent: entry.agent,
      'QA Type': entry.qaType,
      Date: entry.date,
      'Call Center': entry.center,
      'Final Score': entry.score,
      'Call ID': entry.callId || '',
      'Request ID': entry.requestId || '',
      Itinerary: entry.itinerary || '',
      'Call Length': entry.callLength || '',
      Notes: entry.notes || '',
      Markdowns: entry.markdowns?.join(' | ') || '',
      'Submitted By': entry.createdBy,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QA Scores');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `QA-Scores-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("QA Scores Report", 14, 15);

    const tableData = filteredEntries.map(entry => [
      entry.agent,
      entry.qaType,
      entry.date,
      entry.center,
      entry.score,
      entry.callId || '',
      entry.requestId || '',
      entry.itinerary || '',
      entry.callLength || '',
      entry.notes || '',
      (entry.markdowns?.join(', ') || '').slice(0, 60),
      entry.createdBy
    ]);

    doc.autoTable({
      head: [['Agent', 'QA Type', 'Date', 'Center', 'Score', 'Call ID', 'Request ID', 'Itinerary', 'Length', 'Notes', 'Markdowns', 'By']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 9, halign: 'center' },
      theme: 'grid'
    });

    doc.save(`QA-Scores-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <h3 className="mt-5">QA Scores</h3>
      {message && <Alert variant="success">{message}</Alert>}

      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button variant="success" onClick={exportToXLSX}>Export to Excel (.xlsx)</Button>
        <Button variant="danger" onClick={exportToPDF}>Export to PDF</Button>
      </div>

      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Filter by Agent</Form.Label>
          <Form.Control
            type="text"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Filter by Call Center</Form.Label>
          <Form.Select value={filterCenter} onChange={(e) => setFilterCenter(e.target.value)}>
            <option value="">All</option>
            <option value="Teleperformance">Teleperformance</option>
            <option value="Buwelo">Buwelo</option>
            <option value="WNS">WNS</option>
            <option value="Concentrix">Concentrix</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Filter by QA Type</Form.Label>
          <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">All</option>
            <option value="CS">CS</option>
            <option value="Groups">Groups</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Filter by Date</Form.Label>
          <Form.Control
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </Form.Group>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Agent</th>
            <th>QA Type</th>
            <th>Date</th>
            <th>Center</th>
            <th>Score</th>
            <th>Call ID</th>
            <th>Request ID</th>
            <th>Itinerary</th>
            <th>Length</th>
            <th>Notes</th>
            <th>Markdowns</th>
            <th>By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.agent}</td>
              <td>
                <strong style={{ color: entry.qaType === 'CS' ? 'green' : 'blue' }}>
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
                    <li key={i} style={{ color: isOriginal(md) ? 'darkgreen' : 'darkblue' }}>{md}</li>
                  ))}
                </ul>
              </td>
              <td>{entry.createdBy}</td>
              <td>
                {entry.createdBy === user.email ? (
                  <>
                    <Button size="sm" variant="warning" onClick={() => openEditModal(entry)}>Edit</Button>{' '}
                    <Button size="sm" variant="danger" onClick={() => handleDelete(entry.id)}>Delete</Button>
                  </>
                ) : (
                  <span style={{ color: 'gray', fontStyle: 'italic' }}>View only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

export default ScoreTable;
