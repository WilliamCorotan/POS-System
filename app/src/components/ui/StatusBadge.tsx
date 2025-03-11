import React from 'react';
import { Badge } from './Badge';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { label: 'Completed', variant: 'success' as const };
      case 'refunded':
        return { label: 'Refunded', variant: 'error' as const };
      case 'partially_refunded':
        return { label: 'Partially Refunded', variant: 'warning' as const };
      case 'pending':
        return { label: 'Pending', variant: 'info' as const };
      case 'cancelled':
        return { label: 'Cancelled', variant: 'error' as const };
      default:
        return { label: status, variant: 'primary' as const };
    }
  };

  const { label, variant } = getStatusConfig();

  return (
    <Badge
      label={label}
      variant={variant}
      size={size}
      outlined
    />
  );
}