import React from 'react';

interface LoginFormProps {
  action: (formData: FormData) => Promise<any>;
  error?: string;
  className?: string;
  buttonLabel?: string;
  userLabel?: string;
  passwordLabel?: string;
  callbackUrl?: string;
}

export function LoginForm({
  action,
  error,
  className = '',
  buttonLabel = 'Sign In',
  userLabel = 'Username',
  passwordLabel = 'Password',
  callbackUrl,
}: LoginFormProps) {
  return (
    <form action={action} className={`ant-login-form ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '320px' }}>
      <input type="hidden" name="callbackUrl" value={callbackUrl || ''} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="user">{userLabel}</label>
        <input
          id="user"
          name="user"
          type="text"
          required
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label htmlFor="password">{passwordLabel}</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      {error && (
        <div style={{ color: '#d32f2f', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
      <button
        type="submit"
        style={{
          padding: '0.75rem',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: '#000',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
