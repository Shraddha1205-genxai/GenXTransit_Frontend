import React from "react";

interface PrimaryButtonInlineProps {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ComponentType<{ size?: number }>;
  disabled?: boolean;
}

export default function PrimaryButtonInline({
  children,
  onClick,
  icon: Icon,
  disabled = false,
}: PrimaryButtonInlineProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="login-primary-button"
    >
      <span>{children}</span>
      {Icon && <Icon size={17} />}
    </button>
  );
}
