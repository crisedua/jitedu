import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  // Minimal layout for chat pages
  const isChatPage = location.pathname === '/' || location.pathname.startsWith('/chat');

  const navigation = [
    { name: 'Chat', href: '/', icon: MessageSquare, requiredAdmin: false },
    { name: 'Agregar Transcript', href: '/add', icon: Plus, requiredAdmin: true },
    { name: 'Configuración', href: '/settings', icon: Settings, requiredAdmin: false },
  ];

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  // Filter navigation based on role
  const filteredNav = navigation.filter(item => !item.requiredAdmin || isAdmin);

  const SidebarContent = () => (
    <div className="header-content">
      <Link to="/" className="logo">
        <div className="logo-icon">
          <Sparkles size={20} />
        </div>
        <div className="logo-text">
          <h1>Conocimiento on Demand</h1>
          <span>IA Conversacional + Conocimiento</span>
        </div>
      </Link>

      <nav className="main-nav">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="user-section">
        <div className="user-info">
          <div className="avatar">
            <User size={16} />
          </div>
          <div className="user-details">
            <span className="user-email">{user?.email || 'Invitado'}</span>
            <span className="user-role">{user ? (isAdmin ? 'Admin' : 'Usuario') : 'Modo Demo'}</span>
          </div>
        </div>
        {user && (
          <button onClick={logout} className="logout-btn" title="Cerrar Sessión">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  // Full-width layout for chat
  // Note: We still render the sidebar (header) but apply chat-layout class for styling
  if (isChatPage) {
    return (
      <div className="app-container chat-layout">
        <aside className="app-header">
          <SidebarContent />
        </aside>
        {children}
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <aside className="app-header">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;