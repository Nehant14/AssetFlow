import React, { useState } from 'react';
import { register } from '../api/auth.api';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Fleet Manager' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Signup failed', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <input 
          type="email" placeholder="Email" required 
          onChange={e => setFormData({...formData, email: e.target.value})} 
          className="w-full border rounded p-2 mb-4"
        />
        <input 
          type="password" placeholder="Password" required 
          onChange={e => setFormData({...formData, password: e.target.value})} 
          className="w-full border rounded p-2 mb-4"
        />
        {/* Support Role-Based Access Control (RBAC)[cite: 2] */}
        <select 
          onChange={e => setFormData({...formData, role: e.target.value})} 
          className="w-full border rounded p-2 mb-6"
        >
          <option value="Fleet Manager">Fleet Manager</option>
          <option value="Driver">Driver</option>
          <option value="Safety Officer">Safety Officer</option>
          <option value="Financial Analyst">Financial Analyst</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Sign Up</button>
        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;