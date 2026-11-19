import React, { useState, useRef, useEffect } from 'react';
import { PhoneCall } from 'lucide-react';
import { SystemSettings } from '../types';

interface FloatingEmergencyContactProps {
  settings: SystemSettings;
}

export const FloatingEmergencyContact: React.FC<FloatingEmergencyContactProps> = () => {
  // Zalo and Hotline floating buttons have been removed as requested to focus exclusively on the AI Chatbox
  return null;
};
