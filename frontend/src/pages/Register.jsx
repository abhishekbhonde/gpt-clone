import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(name, email, password);
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
            <h1 className="brand-title">ChatGPT Clone</h1>
            <p className="brand-subtitle">Your Personal AI Assistant</p>
          </div>

          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <div className="feature-text">
                <h3>Powered by GPT-4</h3>
                <p>Access to the most advanced AI models</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <div className="feature-text">
                <h3>Secure & Private</h3>
                <p>Your conversations are encrypted and safe</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <div className="feature-text">
                <h3>Your API Key</h3>
                <p>Full control over your OpenAI usage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-description">Join thousands using AI to boost productivity</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Name Field */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

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
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="form-hint">Must be at least 6 characters</p>
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
                    Create Account
                    <ArrowRight className="btn-icon" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <span>Already have an account?</span>
              </div>

              {/* Sign In Link */}
              <Link to="/login" className="btn-secondary">
                Sign In Instead
              </Link>
            </form>

            {/* Terms */}
            <p className="auth-terms">
              By signing up, you agree to our{' '}
              <a href="#" className="terms-link">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="terms-link">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}