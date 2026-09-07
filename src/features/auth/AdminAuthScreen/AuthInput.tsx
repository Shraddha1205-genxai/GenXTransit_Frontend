import React from "react";
import { T } from "../../../constants/theme";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{
    size?: number;
    color?: string;
    style?: React.CSSProperties;
  }>;
  right?: React.ReactNode;
}

export default function AuthInput({
  icon: Icon,
  right,
  ...props
}: AuthInputProps) {
  return (
    <label className="login-input-shell">
      {Icon && <Icon size={17} color={T.textFaint} />}
      <input {...props} />
      {right}
    </label>
  );
}
