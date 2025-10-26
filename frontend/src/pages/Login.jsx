import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/chat');
    }
  };

  return (
    <div className="auth-container">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="auth-content">
        {/* Left Side - Features */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">
              <Sparkles className="icon" />
            </div>
            <h1 className="brand-title">Welcome Back</h1>
            <p className="brand-subtitle">Continue your AI-powered journey</p>
          </div>

          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <div className="feature-text">
                <h3>Fast & Intelligent</h3>
                <p>Get instant responses with GPT-4</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <div className="feature-text">
                <h3>Your Conversations</h3>
                <p>Access your chat history anytime</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <div className="feature-text">
                <h3>Multiple Models</h3>
                <p>Switch between GPT-4, GPT-3.5 and more</p>
              </div>
            </div>
          </div>

          <div className="auth-stats">
            <div className="stat-item">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Conversations</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Sign In</h2>
              <p className="auth-description">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Password</label>
                  <a href="#" className="forgot-password">Forgot password?</a>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input type="checkbox" className="checkbox-input" />
                  <span className="checkbox-text">Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <div className="btn-loader"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="btn-icon" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <span>Don't have an account?</span>
              </div>

              {/* Sign Up Link */}
              <Link to="/register" className="btn-secondary">
                Create New Account
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}