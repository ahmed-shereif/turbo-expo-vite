import React from 'react';

export const Screen: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
export const BrandCard: React.FC<{ children?: React.ReactNode }> = ({ children }) => <div>{children}</div>;
export const BrandButton: React.FC<{ children?: React.ReactNode; onPress?: () => void; variant?: string; disabled?: boolean }> = ({ children, onPress }) => (
  <button onClick={onPress}>{children}</button>
);

export default { Screen, BrandCard, BrandButton };


