import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const RESIZE_OBSERVER_LOOP_ERRORS = [
  "ResizeObserver loop completed with undelivered notifications.",
  "ResizeObserver loop limit exceeded",
];

const isResizeObserverLoopError = (value) =>
  RESIZE_OBSERVER_LOOP_ERRORS.some((message) =>
    String(value || "").includes(message)
  );

window.addEventListener("error", (event) => {
  if (isResizeObserverLoopError(event?.message)) {
    event.stopImmediatePropagation();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (isResizeObserverLoopError(event?.reason?.message || event?.reason)) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
