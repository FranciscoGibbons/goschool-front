import React from "react";

interface StatusCardProps {
  icon: React.ReactNode;
  text: string;
  bg: string;
  border: string;
  textColor: string;
}

export function StatusCard({
  icon,
  text,
  bg,
  border,
  textColor,
}: StatusCardProps) {
  return (
    <div className={`flex items-center p-3 rounded-lg border ${bg} ${border}`}>
      {icon}
      <span className={`ml-2 ${textColor}`}>{text}</span>
    </div>
  );
}
