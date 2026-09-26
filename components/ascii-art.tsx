import React, { useEffect, useRef, useState } from 'react';

const AsciiArt: React.FC = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; height?: number }>({ scale: 1 });

  useEffect(() => {
    const pre = preRef.current;
    const container = containerRef.current;
    if (!pre || !container) return;

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const artWidth = pre.scrollWidth;
      // Calculate a scale factor if the art overflows the container
      const scale = containerWidth < artWidth ? containerWidth / artWidth : 1;
      // transform: scale() leaves the layout box at full size, so reserve only
      // the scaled height; otherwise the difference shows up as an empty gap
      // under the art (about 150px on a 2560px screen).
      const height = pre.offsetHeight * scale;
      setFit(prev => (prev.scale === scale && prev.height === height ? prev : { scale, height }));
    };

    measure();
    // Observing the elements, not the window, also catches the fullscreen
    // toggle, which resizes the terminal without resizing the window.
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(pre);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", overflow: "hidden", height: fit.height }}>
      <pre
        ref={preRef}
        style={{
          fontFamily: "monospace",
          whiteSpace: "pre",
          // Width-driven, capped by height: on a short, wide screen (a phone
          // in landscape) 1vw alone made the art fill the whole terminal and
          // pushed the intro and prompt below the fold. Portrait phones,
          // tablets and desktops never reach the cap.
          fontSize: "min(4px + 1vw, 2.4vh)",
          margin: 0,
          padding: 0,
          transform: `scale(${fit.scale})`,
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

