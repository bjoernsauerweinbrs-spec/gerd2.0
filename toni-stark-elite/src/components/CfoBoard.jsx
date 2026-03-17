import React from 'react';
import Icon from './Icon';

const CfoBoard = ({ truthObject }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="pie-chart" size={24} className="text-gold" />
        <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">CFO Board</h2>
      </div>
      <div className="p-12 text-center border border-white/10 rounded-2xl bg-black/40">
        <p className="font-mono text-gold text-sm">CFO Board Module Migration pending...</p>
      </div>
    </div>
  );
};

export default CfoBoard;
