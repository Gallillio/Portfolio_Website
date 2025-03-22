import React from 'react';
import { Tooltip } from "@/components/ui/tooltip";

interface LinkWithTooltipProps {
  href: string;
  text: string;
}

const LinkWithTooltip: React.FC<LinkWithTooltipProps> = ({ href, text }) => {
  return (
    <Tooltip text="Follow Link: ctrl + click">
      <span className="text-green-400 hover:underline cursor-pointer relative group">
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-green-400 underline">
          {text}
        </a>
      </span>
    </Tooltip>
  );
};

export default LinkWithTooltip;
