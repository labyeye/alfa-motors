import React from 'react';

export default function ImagePreview({ src, alt }) {
  if (!src) return null;
  
  const lower = src.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return <a href={src} target="_blank" rel="noreferrer">Open PDF</a>;
  }
  return <img src={src} alt={alt || 'preview'} style={{ maxWidth: '100%', height: 'auto' }} />;
}
