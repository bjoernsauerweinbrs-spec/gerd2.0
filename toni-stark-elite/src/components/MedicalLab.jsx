import React from 'react';
import Icon from './Icon';

const MedicalLab = ({ truthObject }) => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Icon name="heart-pulse" size={24} className="text-redbull" />
        <h2 className="text-2xl font-black uppercase tracking-widest text-white italic">Medical Lab</h2>
      </div>
      <div className="p-12 text-center border border-white/10 rounded-2xl bg-black/40">
        <p className="font-mono text-redbull text-sm">Medical Lab Module Migration pending...</p>
      </div>
    </div>
  );
};

export default MedicalLab;
