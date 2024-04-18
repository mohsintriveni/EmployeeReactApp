import React, { useState } from 'react';

function LoginForm({ login, showRegisterForm }) {
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const onSubmit = (e) => {
      e.preventDefault();
      login({email,password});
    };
  
    return (
      <form className='limitedwidth mx-auto' onSubmit={onSubmit}>
        <h2>Login</h2>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Username or Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="button" className="btn btn-secondary" onClick={showRegisterForm}>Register</button>
      </form>
    );
  }

  export default LoginForm;
