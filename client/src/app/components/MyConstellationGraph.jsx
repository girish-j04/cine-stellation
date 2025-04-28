'use client';
import { useRef, useState, useEffect } from 'react';
import useMyConstellationData from '../components/useMyConstellationData';
import { drawConnections } from './ConnectionRenderer';
import { drawMovieNode } from './MovieNodeRenderer';

export default function MyConstellationGraph({ userEmail }) {
  const canvasRef = useRef(null);
  const { nodes, edges } = useMyConstellationData(userEmail);

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (!source || !target) return;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const color = node.watched ? '#50fa7b' : '#ff5555'; // green if watched, red if suggestion
      drawMovieNode(ctx, node, false, false, null, color);
    });

    ctx.restore();
  }, [nodes, edges]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e1e2f' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
