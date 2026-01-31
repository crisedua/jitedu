import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { signIn, signUp, user } = useAuth();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);

        try {
            if (isRegistering) {
                // Register flow
                // signUp returns { user, session } inside data
                const { user, session } = await signUp(name, email, password);

                // If session exists, the user is logged in immediately (no email confirm needed)
                // The useEffect will handle the redirect.

                // If user exists but NO session, then email confirmation is required.
                if (user && !session) {
                    setMessage('Cuenta creada! Por favor revisa tu email para confirmar.');
                }
            } else {
                // Login flow
                await signIn(email, password);
                // On success, user state updates and useEffect redirects
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-icon large">
                        <Sparkles size={40} />
                    </div>
                    <h1>{isRegistering ? 'Crear Cuenta' : 'Bienvenido'}</h1>
                    <p>IA Conversacional y Base de Conocimiento</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">

                    {isRegistering && (
                        <div className="form-group">
                            <label htmlFor="name">Nombre</label>
                            <div className="input-with-icon">
                                <User size={20} />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Tu nombre completo"
                                    required={isRegistering}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-with-icon">
                            <Mail size={20} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nombre@ejemplo.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-with-icon">
                            <Lock size={20} />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="success-message-inline">
                            {message}
                        </div>
                    )}

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? <Loader2 size={20} className="spinning" /> : (isRegistering ? 'Registrarse' : 'Ingresar')}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="auth-toggle">
                    {isRegistering ? (
                        <p>¿Ya tienes cuenta? <button onClick={() => setIsRegistering(false)}>Inicia Sesión</button></p>
                    ) : (
                        <p>¿Nuevo aquí? <button onClick={() => setIsRegistering(true)}>Crea una cuenta</button></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
