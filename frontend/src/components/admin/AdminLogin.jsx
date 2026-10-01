import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-block w-12 h-1 bg-accent mb-6" />
          <h1 className="font-display text-5xl text-white tracking-wider mb-2">ADMIN</h1>
          <p className="text-text-secondary text-sm">Shoaib Zafar — Portfolio Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full bg-card border border-border text-white placeholder-text-muted px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-card border border-border text-white placeholder-text-muted px-4 py-3 rounded focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-light text-white font-medium py-3 rounded transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-text-muted text-xs mt-8">
          <a href="/" className="hover:text-white transition-colors">← Back to portfolio</a>
        </p>
      </div>
    </div>
  );
}
