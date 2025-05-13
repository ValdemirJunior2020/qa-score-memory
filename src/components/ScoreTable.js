// src/components/ScoreTable.js
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

function ScoreTable({ user }) {
  const [entries, setEntries] = useState([]);
  const [filterAgent, setFilterAgent] = useState('');
  const [filterCenter, setFilterCenter] = useState('');
  const [filterDate, setFilterDate] = useState('');
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
      (filterDate ? entry.date === filterDate : true)
    );
  });

  // Summary calculations
  const totalEvaluations = filteredEntries.length;
  const uniqueAgents = new Set(filteredEntries.map((e) => e.agent)).size;
  const latestDate = filteredEntries.reduce((latest, current) =>
    !latest || new Date(current.date) > new Date(latest) ? current.date : latest, null);

  const centerCount = filteredEntries.reduce((acc, curr) => {
    acc[curr.center] = (acc[curr.center] || 0) + 1;
    return acc;
  }, {});

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
      Date: entry.date,
      'Call Center': entry.center,
      'Final Score': entry.score,
      Markdowns: entry.markdowns?.join(' | ') || '',
      'Submitted By': entry.createdBy,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'QA Scores');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `QA-Scores-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("QA Scores Report", 14, 15);

    const tableData = filteredEntries.map(entry => [
      entry.agent,
      entry.date,
      entry.center,
      entry.score,
      (entry.markdowns?.join(', ') || '').slice(0, 60),
      entry.createdBy
    ]);

    doc.autoTable({
      head: [['Agent', 'Date', 'Call Center', 'Score', 'Markdowns', 'Submitted By']],
      body: tableData,
      startY: 20,
      styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 10,
        cellPadding: 3
      },
      theme: 'grid'
    });

    doc.save(`QA-Scores-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <>
      <h3 className="mt-5">QA Scores</h3>
      {message && <Alert variant="success">{message}</Alert>}

      {/* Summary block */}
      <div className="my-4">
        <h5>📋 Summary</h5>
        <ul>
          <li><strong>Total QA Evaluations:</strong> {totalEvaluations}</li>
          <li><strong>Unique Agents QA’d:</strong> {uniqueAgents}</li>
          <li><strong>Latest QA Date:</strong> {latestDate || 'N/A'}</li>
          <li><strong>By Call Center:</strong>
            <ul>
              {Object.entries(centerCount).map(([center, count]) => (
                <li key={center}>{center}: {count}</li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

      {/* Export buttons */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <Button variant="success" onClick={exportToXLSX}>
          Export to Excel (.xlsx)
        </Button>
        <Button variant="danger" onClick={exportToPDF}>
          Export to PDF
        </Button>
      </div>

      {/* Filters */}
      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Filter by Agent</Form.Label>
          <Form.Control
            type="text"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            placeholder="Enter agent name"
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
          <Form.Label>Filter by Date</Form.Label>
          <Form.Control
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </Form.Group>
      </Form>

      {/* QA table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Date</th>
            <th>Call Center</th>
            <th>Score</th>
            <th>Markdowns</th>
            <th>By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => (
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

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit QA Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Agent</Form.Label>
            <Form.Control
              type="text"
              value={editEntry?.agent || ''}
              onChange={(e) => handleEditChange('agent', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={editEntry?.date || ''}
              onChange={(e) => handleEditChange('date', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Call Center</Form.Label>
            <Form.Select
              value={editEntry?.center || ''}
              onChange={(e) => handleEditChange('center', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Teleperformance">Teleperformance</option>
              <option value="Buwelo">Buwelo</option>
              <option value="WNS">WNS</option>
              <option value="Concentrix">Concentrix</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Score</Form.Label>
            <Form.Control
              type="number"
              value={editEntry?.score || ''}
              onChange={(e) => handleEditChange('score', e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="success" onClick={saveEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ScoreTable;
