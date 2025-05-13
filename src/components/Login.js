// src/components/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, Form, Alert } from 'react-bootstrap';

const adminEmails = [
  'adminjr@admin.com',
  'adminbarb@admin.com',
  'adminphill@admin.com'
];

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userEmail = userCredential.user.email;
      if (!adminEmails.includes(userEmail)) {
        setError('Access denied: Admins only.');
        return;
      }
      setUser(userCredential.user);
    } catch (err) {
      setError('Login failed. Check credentials.');
    }
  };

  return (
    <Form onSubmit={handleLogin}>
      <h2 className="mb-3">Admin Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group controlId="email" className="mb-3">
        <Form.Label>Email:</Form.Label>
        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Form.Group>
      <Form.Group controlId="password" className="mb-3">
        <Form.Label>Password:</Form.Label>
        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </Form.Group>
      <Button type="submit" variant="primary">Login</Button>
    </Form>
  );
}

export default Login;
