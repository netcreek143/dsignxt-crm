import React, { useState } from 'react';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useStore from '../../data/store';
import './Login.css';

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('suriya@dsignxt.com');
    const [password, setPassword] = useState('dsignxt123');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            onLogin();
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-shapes">
                <div className="shape shape-1" /><div className="shape shape-2" /><div className="shape shape-3" />
            </div>
            <div className="login-card animate-slide-up">
                <div className="login-brand">
                    <div className="login-logo"><Zap size={28} /></div>
                    <h1 className="login-title">DSignXT<span>CRM</span></h1>
                    <p className="login-subtitle">Agency Lead Management Platform</p>
                </div>
                {error && <div className="login-error animate-shake">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="login-input-wrap"><Mail size={16} /><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@agency.com" required /></div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="login-input-wrap"><Lock size={16} /><input className="form-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <label className="checkbox-wrapper text-sm"><input type="checkbox" className="checkbox" defaultChecked />Remember me</label>
                        <a className="link text-sm">Forgot password?</a>
                    </div>
                    <button type="submit" className={`btn btn-primary login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                        {loading ? <span className="animate-pulse">Signing in...</span> : <>Sign In <ArrowRight size={16} /></>}
                    </button>
                </form>
                <p className="login-footer" style={{ lineHeight: '1.5' }}>
                    Demo accounts (Password: dsignxt123)<br/>
                    • Admin: suriya@dsignxt.com<br/>
                    • Client: client@timeline.in
                </p>
            </div>
        </div >
    );
}
