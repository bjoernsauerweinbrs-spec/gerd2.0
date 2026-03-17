import React from 'react';
import Icon from './Icon';

const NlzAcademy = ({ truthObject }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="graduation-cap" size={24} className="text-neon" />
        <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">NLZ Academy</h2>
      </div>
      <div className="p-12 text-center border border-white/10 rounded-2xl bg-black/40">
        <p className="font-mono text-neon text-sm">NLZ Academy Module Migration pending...</p>
      </div>
    </div>
  );
};

export default NlzAcademy;
