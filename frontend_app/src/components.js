import React, { useEffect, useState } from 'react';

// Styling helpers
export const colors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#06b6d4',
  error: '#EF4444',
  bg: '#f9fafb',
  surface: '#ffffff',
  text: '#111827',
};

// PUBLIC_INTERFACE
export function Button({ children, variant = 'primary', ...props }) {
  /** A themed button component. Variants: primary, success, secondary, danger, ghost */
  const map = {
    primary: { bg: colors.primary, color: '#fff' },
    success: { bg: colors.success, color: '#fff' },
    secondary: { bg: colors.secondary, color: '#fff' },
    danger: { bg: colors.error, color: '#fff' },
    ghost: { bg: 'transparent', color: colors.text, border: `1px solid #e5e7eb` },
  };
  const style = {
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    border: map[variant].border || 'none',
    background: map[variant].bg,
    color: map[variant].color,
    cursor: 'pointer',
    transition: 'transform .1s ease, opacity .2s ease, box-shadow .2s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  };
  return (
    <button
      style={style}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      {...props}
    >
      {children}
    </button>
  );
}

// PUBLIC_INTERFACE
export function Input({ label, error, ...props }) {
  /** Simple labeled input */
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          outline: 'none',
          fontSize: 14,
        }}
        {...props}
      />
      {error && <div style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// PUBLIC_INTERFACE
export function TextArea({ label, error, ...props }) {
  /** Simple labeled textarea */
  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, color: '#374151', marginBottom: 6 }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          outline: 'none',
          fontSize: 14,
          minHeight: 80,
        }}
        {...props}
      />
      {error && <div style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// PUBLIC_INTERFACE
export function Card({ title, action, children, style }) {
  /** Surface card */
  return (
    <div
      style={{
        background: colors.surface,
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        ...style,
      }}
    >
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          {title && <div style={{ fontWeight: 700, color: colors.text, fontSize: 16 }}>{title}</div>}
          <div style={{ marginLeft: 'auto' }}>{action}</div>
        </div>
      )}
      {children}
    </div>
  );
}

// PUBLIC_INTERFACE
export function Modal({ open, title, onClose, children }) {
  /** Basic centered modal */
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17,24,39,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: colors.surface,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: colors.text }}>{title}</div>
          <div style={{ marginLeft: 'auto' }}>
            <Button variant="ghost" onClick={onClose} aria-label="Close">✕</Button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Spinner({ size = 16 }) {
  /** Simple spinner */
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
        borderTopColor: colors.primary,
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}

// PUBLIC_INTERFACE
export function useAsync(asyncFn, deps = []) {
  /** Hook to manage loading/error/data for async calls */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const reload = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await asyncFn(...args);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { loading, error, data, reload, setData, setError, setLoading };
}
