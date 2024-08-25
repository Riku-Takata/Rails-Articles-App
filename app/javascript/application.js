import Rails from "@rails/ujs";
Rails.start();

import React from 'react';
import ReactDOM from 'react-dom/client';
import "tailwindcss/tailwind.css";
import Articles from './components/Articles';

document.addEventListener('DOMContentLoaded', () => {
  const node = document.getElementById('react-articles');
  if (node) {
    const root = ReactDOM.createRoot(node);
    root.render(<Articles />);
  }
});