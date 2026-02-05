import React, { useState, useEffect } from 'react';
import { getExperts, saveSelectedExpert, getSelectedExpert } from '../lib/experts';
import { Check, ChevronDown } from 'lucide-react';

const ExpertSelector = ({ onExpertChange, userId = 'default-user' }) => {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExperts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExperts = async () => {
    try {
      const expertsData = await getExperts();
      setExperts(expertsData);

      // Load previously selected expert
      const savedExpertId = await getSelectedExpert(userId);
      const expert = savedExpertId 
        ? expertsData.find(e => e.id === savedExpertId) || expertsData[0]
        : expertsData[0];

      setSelectedExpert(expert);
      if (onExpertChange) {
        onExpertChange(expert);
      }
    } catch (error) {
      console.error('Error loading experts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExpert = async (expert) => {
    setSelectedExpert(expert);
    setIsOpen(false);
    
    // Save selection
    await saveSelectedExpert(userId, expert.id);
    
    // Notify parent component
    if (onExpertChange) {
      onExpertChange(expert);
    }
  };

  if (isLoading) {
    return (
      <div className="expert-selector-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!selectedExpert) return null;

  return (
    <div className="expert-selector">
      <button
        className="expert-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          borderColor: selectedExpert.color_theme
        }}
      >
        <div className="expert-info">
          <div 
            className="expert-avatar"
            style={{ 
              background: `linear-gradient(135deg, ${selectedExpert.color_theme}, ${adjustColor(selectedExpert.color_theme, -20)})`
            }}
          >
            {selectedExpert.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="expert-details">
            <div className="expert-name">{selectedExpert.name}</div>
            <div className="expert-specialty">{selectedExpert.specialty}</div>
          </div>
        </div>
        <ChevronDown 
          size={20} 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s'
          }} 
        />
      </button>

      {isOpen && (
        <>
          <div className="expert-selector-overlay" onClick={() => setIsOpen(false)} />
          <div className="expert-selector-dropdown">
            <div className="dropdown-header">
              <h3>Selecciona un Experto</h3>
              <p>Cada experto tiene conocimiento especializado en su área</p>
            </div>
            <div className="experts-list">
              {experts.map(expert => (
                <button
                  key={expert.id}
                  className={`expert-option ${selectedExpert.id === expert.id ? 'selected' : ''}`}
                  onClick={() => handleSelectExpert(expert)}
                  style={{
                    borderLeft: `4px solid ${expert.color_theme}`
                  }}
                >
                  <div className="expert-option-content">
                    <div 
                      className="expert-avatar-small"
                      style={{ 
                        background: `linear-gradient(135deg, ${expert.color_theme}, ${adjustColor(expert.color_theme, -20)})`
                      }}
                    >
                      {expert.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="expert-option-info">
                      <div className="expert-option-name">{expert.name}</div>
                      <div className="expert-option-title">{expert.title}</div>
                      <div className="expert-option-description">{expert.description}</div>
                    </div>
                  </div>
                  {selectedExpert.id === expert.id && (
                    <Check size={20} style={{ color: expert.color_theme }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
  const clamp = (val) => Math.min(Math.max(val, 0), 255);
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

export default ExpertSelector;
