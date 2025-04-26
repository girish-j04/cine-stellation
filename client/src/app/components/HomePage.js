"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [fadeOut, setFadeOut] = useState(false);
  const [typedText, setTypedText] = useState('');
  const fullTagline = "Where the stars align to find you movies";
  const router = useRouter();

  // Navigate to login after fade-out
  const handleEnterApp = () => {
    setFadeOut(true);
    setTimeout(() => {
      router.push('/login'); // Route to login page
    }, 500);
  };

  // Typing animation logic
  useEffect(() => {
    if (typedText.length < fullTagline.length) {
      const typingTimer = setTimeout(() => {
        setTypedText(fullTagline.substring(0, typedText.length + 1));
      }, 70);
      return () => clearTimeout(typingTimer);
    }
  }, [typedText, fullTagline]);

  return (
    <div 
      className={`home-container ${fadeOut ? 'fade-out' : ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        transition: 'opacity 0.5s ease-in-out',
        opacity: fadeOut ? 0 : 1
      }}
    >
      <h1 style={{
        fontSize: '4rem',
        color: 'white',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.7)',
        marginBottom: '2rem',
        fontWeight: '300',
        letterSpacing: '0.2rem'
      }}>
        Cine-Stellation
      </h1>

      <p style={{
        fontSize: '1.5rem',
        color: 'rgba(255, 255, 255, 0.8)',
        maxWidth: '600px',
        textAlign: 'center',
        marginBottom: '3rem',
        height: '2em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {typedText}
        <span style={{
          borderRight: '0.15em solid rgba(255, 255, 255, 0.8)',
          animation: 'blink-caret 0.75s step-end infinite',
          marginLeft: '2px',
          display: typedText.length >= fullTagline.length ? 'none' : 'inline-block'
        }}/>
      </p>

      <style jsx>{`
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: rgba(255, 255, 255, 0.8) }
        }
      `}</style>

      <button
        onClick={handleEnterApp}
        style={{
          padding: '12px 30px',
          fontSize: '1.2rem',
          backgroundColor: 'rgba(75, 75, 250, 0.7)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '30px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(5px)',
          boxShadow: '0 0 20px rgba(75, 75, 250, 0.5)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(100, 100, 255, 0.8)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(75, 75, 250, 0.7)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Get Started
      </button>
    </div>
  );
}
