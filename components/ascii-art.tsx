import React, { useEffect, useRef, useState } from 'react';

const AsciiArt: React.FC = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (preRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const artWidth = preRef.current.scrollWidth;
        // Calculate a scale factor if the art overflows the container
        const newScale = containerWidth < artWidth ? containerWidth / artWidth : 1;
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
      <pre
        ref={preRef}
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre",
          fontSize: "calc(6px + 1vw)", // Base font size
          margin: 0,
          padding: 0,
          transform: `scale(${scale})`,
          transformOrigin: "left top",
        }}
      >
{`
 ██████╗  █████╗  ██╗       ██╗      ██╗  ██╗     ██╗      ██╗  ██████╗ 
██╔════╝ ██╔══██╗ ██║       ██║      ██║  ██║     ██║      ██║ ██╔═══██╗
██║  ███╗███████║ ██║       ██║      ██║  ██║     ██║      ██║ ██║   ██║
██║   ██║██╔══██║ ██║       ██║      ██║  ██║     ██║      ██║ ██║   ██║
╚██████╔╝██║  ██║ ███████╗  ███████╗ ██║  ███████╗███████╗ ██║ ╚██████╔╝
 ╚═════╝ ╚═╝  ╚═╝ ╚══════╝  ╚══════╝ ╚═╝  ╚══════╝╚══════╝ ╚═╝  ╚═════╝
██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗  ██████╗ 
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║ ██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║ ██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║ ██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║ ╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝  ╚═════╝ 
                                                                       
`}
      </pre>
    </div>
  );
};

export default AsciiArt;

