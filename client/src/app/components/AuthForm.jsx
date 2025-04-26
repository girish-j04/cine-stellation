"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthForm({ type }) {
  const isLogin = type === 'login';
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.ok) {
        router.push('/graph');
      } else {
        setError('Invalid email or password.');
      }
    } else {
      try {
        const res = await fetch('http://127.0.0.1:8000/users/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          router.push('/login');
        } else {
          const err = await res.json();
          setError(err.detail || 'Signup failed.');
        }
      } catch (err) {
        console.error(err);
        setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>{isLogin ? 'Welcome Back' : 'Create Your Account'}</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        {error && <p style={errorStyle}>{error}</p>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href={isLogin ? '/signup' : '/login'} style={{ color: '#8be9fd' }}>
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </Link>
        </div>
      </form>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#282a36',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#f8f8f2',
  padding: '1rem',
};

const headerStyle = {
  fontSize: '2.5rem',
  marginBottom: '1.5rem',
  textShadow: '0 0 10px rgba(255,255,255,0.3)',
};

const formStyle = {
  backgroundColor: 'rgba(0,0,0,0.4)',
  padding: '2rem',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 0 20px rgba(75, 75, 250, 0.5)',
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px',
  margin: '10px 0 20px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  background: '#444',
  color: '#f8f8f2',
};

const buttonStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '25px',
  backgroundColor: 'rgba(75, 75, 250, 0.7)',
  color: 'white',
  border: 'none',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const errorStyle = {
  background: '#ff5555',
  padding: '8px',
  borderRadius: '6px',
  marginBottom: '1rem',
  textAlign: 'center',
  color: '#fff',
};
