import React from "react";
import useBaseUrl from '@docusaurus/useBaseUrl';

const AnimatedTelcofyPin = ({ width = 100, height = 100, className = "" }) => {
  const baseUrl = useBaseUrl('/');
  
  return (
    <div className={`telcofy-pin-container ${className}`} style={{ width, height }}>
      {/* Base pin image */}
      <img
        src={useBaseUrl('/img/telcofyPin.svg')}
        alt="Telcofy Pin"
        className="telcofy-pin-image"
      />

      {/* Container for circles with perspective */}
      <div className="telcofy-pin-animation-container">
        <div className="telcofy-pin-perspective-container">
          {/* Animated circles */}
          <div className="telcofy-pin-circle telcofy-pin-circle-slow" />
          <div className="telcofy-pin-circle telcofy-pin-circle-medium" />
          <div className="telcofy-pin-circle telcofy-pin-circle-fast" />
        </div>
      </div>

      <style>
        {`
          .telcofy-pin-container {
            position: relative;
          }

          .telcofy-pin-image {
            width: 100%;
            height: 100%;
            position: relative;
            z-index: 10;
          }

          .telcofy-pin-animation-container {
            position: absolute;
            top: 95%;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            perspective: 1000px;
          }

          .telcofy-pin-perspective-container {
            position: relative;
            width: 100%;
            height: 32px;
            transform-style: preserve-3d;
            transform: rotateX(60deg);
          }

          .telcofy-pin-circle {
            position: absolute;
            left: 50%;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 1px solid #34d399;
            opacity: 0.75;
            transform: translateX(-50%);
          }

          .telcofy-pin-circle-slow {
            animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          }

          .telcofy-pin-circle-medium {
            animation: ping-medium 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.7s;
          }

          .telcofy-pin-circle-fast {
            animation: ping-fast 2s cubic-bezier(0, 0, 0.2, 1) infinite 1.4s;
          }

          @keyframes ping-slow {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 0.75;
            }
            100% {
              transform: translateX(-50%) scale(10);
              opacity: 0;
            }
          }

          @keyframes ping-medium {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 0.75;
            }
            100% {
              transform: translateX(-50%) scale(10);
              opacity: 0;
            }
          }

          @keyframes ping-fast {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 0.75;
            }
            100% {
              transform: translateX(-50%) scale(10);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AnimatedTelcofyPin;
