import React, { useState, useRef, useEffect } from 'react';

// Import all norm table images directly for Vite
import norm_table_1 from './../assets/norm_tables/6.jpg';
import norm_table_2 from './../assets/norm_tables/7.jpg';
import norm_table_3 from './../assets/norm_tables/8.jpg';
import norm_table_4 from './../assets/norm_tables/9.jpg';
import norm_table_5 from './../assets/norm_tables/10.jpg';
import norm_table_6 from './../assets/norm_tables/11.jpg';
import norm_table_7 from './../assets/norm_tables/12.jpg';
import norm_table_8 from './../assets/norm_tables/13.jpg';
import norm_table_9 from './../assets/norm_tables/14.jpg';
import norm_table_10 from './../assets/norm_tables/15.jpg';

const normTableImages = [
  { src: norm_table_1, title: "Norm Table for Age 6" },
  { src: norm_table_2, title: "Norm Table for Age 7" },
  { src: norm_table_3, title: "Norm Table for Age 8" },
  { src: norm_table_4, title: "Norm Table for Age 9" },
  { src: norm_table_5, title: "Norm Table for Age 10" },
  { src: norm_table_6, title: "Norm Table for Age 11" },
  { src: norm_table_7, title: "Norm Table for Age 12" },
  { src: norm_table_8, title: "Norm Table for Age 13" },
  { src: norm_table_9, title: "Norm Table for Age 14" },
  { src: norm_table_10, title: "Norm Table for Age 15" },
];

const NormTableModal = ({ isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startMousePos, setStartMousePos] = useState({ x: 0, y: 0 });

  const [isPrevHovered, setIsPrevHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);
  const [isZoomInHovered, setIsZoomInHovered] = useState(false);
  const [isZoomOutHovered, setIsZoomOutHovered] = useState(false);

  const [isPrevPressed, setIsPrevPressed] = useState(false);
  const [isNextPressed, setIsNextPressed] = useState(false);
  const [isZoomInPressed, setIsZoomInPressed] = useState(false);
  const [isZoomOutPressed, setIsZoomOutPressed] = useState(false);

  const imgRef = useRef(null);
  const modalContentRef = useRef(null); // Ref for the modal content area to get its dimensions

  // Reset zoom and position when image changes
  useEffect(() => {
    setZoomLevel(1);
    setTranslateX(0);
    setTranslateY(0);
  }, [currentImageIndex]);

  if (!isOpen) return null;

  const constrainTranslation = (newX, newY) => {
    if (!imgRef.current || !modalContentRef.current) return [newX, newY];

    const imgWidth = imgRef.current.clientWidth * zoomLevel;
    const imgHeight = imgRef.current.clientHeight * zoomLevel;
    const modalWidth = modalContentRef.current.clientWidth;
    const modalHeight = modalContentRef.current.clientHeight;

    const maxX = Math.max(0, (imgWidth - modalWidth) / 2);
    const maxY = Math.max(0, (imgHeight - modalHeight) / 2);

    // Constrain X
    let constrainedX = newX;
    if (imgWidth > modalWidth) {
      constrainedX = Math.max(-maxX, Math.min(maxX, newX));
    } else {
      constrainedX = 0; // No horizontal panning if image fits
    }

    // Constrain Y
    let constrainedY = newY;
    if (imgHeight > modalHeight) {
      constrainedY = Math.max(-maxY, Math.min(maxY, newY));
    } else {
      constrainedY = 0; // No vertical panning if image fits
    }

    return [constrainedX, constrainedY];
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) { // Only allow dragging when zoomed in
      setIsDragging(true);
      setStartMousePos({ x: e.clientX - translateX, y: e.clientY - translateY });
      e.preventDefault(); // Prevent default image drag behavior
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - startMousePos.x;
      const newY = e.clientY - startMousePos.y;
      const [constrainedX, constrainedY] = constrainTranslation(newX, newY);
      setTranslateX(constrainedX);
      setTranslateY(constrainedY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % normTableImages.length);
    // Reset position on image change
    setTranslateX(0);
    setTranslateY(0);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + normTableImages.length) % normTableImages.length
    );
    // Reset position on image change
    setTranslateX(0);
    setTranslateY(0);
  };

  const zoomIn = () => {
    setZoomLevel((prevZoom) => {
      const newZoom = Math.min(prevZoom + 0.1, 3); // Max zoom 3x
      // No need to reset translate here, constrainTranslation will handle it on next move
      return newZoom;
    });
  };

  const zoomOut = () => {
    setZoomLevel((prevZoom) => {
      const newZoom = Math.max(prevZoom - 0.1, 0.5); // Min zoom 0.5x
      if (newZoom <= 1) { // Reset position if zooming out to or below 1x
        setTranslateX(0);
        setTranslateY(0);
      }
      return newZoom;
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker, more opaque overlay
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves modal area
    >
      <div
        ref={modalContentRef} // Attach ref here
        style={{
          backgroundColor: '#ffffff', // Pure white background
          padding: '30px', // Increased padding
          borderRadius: '12px', // More rounded corners
          position: 'relative',
          maxHeight: '90%',
          maxWidth: '90%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)', // Stronger shadow
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '2rem', // Larger close icon
            cursor: 'pointer',
            color: '#333', // Darker color for close icon
          }}
        >
          &times;
        </button>

        {normTableImages.length > 0 && (
          <>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '10px' }}>
              {normTableImages[currentImageIndex].title}
            </h3>
            <div style={{ overflow: 'hidden', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img
                ref={imgRef} // Attach ref here
                src={normTableImages[currentImageIndex].src}
                alt={normTableImages[currentImageIndex].title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  transform: `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`,
                  transition: 'transform 0.1s ease-out',
                  cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
                  userSelect: 'none',
                }}
                onMouseDown={handleMouseDown}
              />
            </div>
            {/* Thumbnail navigation strip */}
            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                maxWidth: '100%',
                padding: '10px 0',
                gap: '10px',
                justifyContent: 'center',
                marginTop: '10px',
              }}
            >
              {normTableImages.map((image, index) => (
                <img
                  key={index}
                  src={image.src}
                  alt={image.title}
                  title={image.title} // Add title for tooltip on hover
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: index === currentImageIndex ? '2px solid #9b1c1c' : '2px solid transparent',
                    borderRadius: '5px',
                    transition: 'border 0.2s ease-in-out',
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: '15px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={goToPrevious}
                onMouseEnter={() => setIsPrevHovered(true)}
                onMouseLeave={() => setIsPrevHovered(false)}
                onMouseDown={() => setIsPrevPressed(true)}
                onMouseUp={() => setIsPrevPressed(false)}
                style={{
                  padding: '8px 12px',
                  fontSize: '1.5rem',
                  backgroundColor: isPrevPressed ? '#7f1616' : (isPrevHovered ? '#a82a2a' : '#9b1c1c'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, transform 0.1s ease',
                  transform: isPrevPressed ? 'scale(0.98)' : 'scale(1)',
                }}
              >‹</button>
              <span>
                {currentImageIndex + 1} / {normTableImages.length}
              </span>
              <button
                onClick={goToNext}
                onMouseEnter={() => setIsNextHovered(true)}
                onMouseLeave={() => setIsNextHovered(false)}
                onMouseDown={() => setIsNextPressed(true)}
                onMouseUp={() => setIsNextPressed(false)}
                style={{
                  padding: '8px 12px',
                  fontSize: '1.5rem',
                  backgroundColor: isNextPressed ? '#7f1616' : (isNextHovered ? '#a82a2a' : '#9b1c1c'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, transform 0.1s ease',
                  transform: isNextPressed ? 'scale(0.98)' : 'scale(1)',
                }}
              >›</button>
              <button
                onClick={zoomIn}
                onMouseEnter={() => setIsZoomInHovered(true)}
                onMouseLeave={() => setIsZoomInHovered(false)}
                onMouseDown={() => setIsZoomInPressed(true)}
                onMouseUp={() => setIsZoomInPressed(false)}
                style={{
                  padding: '8px 12px',
                  fontSize: '1.5rem',
                  backgroundColor: isZoomInPressed ? '#7f1616' : (isZoomInHovered ? '#a82a2a' : '#9b1c1c'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, transform 0.1s ease',
                  transform: isZoomInPressed ? 'scale(0.98)' : 'scale(1)',
                }}
              >+</button>
              <button
                onClick={zoomOut}
                onMouseEnter={() => setIsZoomOutHovered(true)}
                onMouseLeave={() => setIsZoomOutHovered(false)}
                onMouseDown={() => setIsZoomOutPressed(true)}
                onMouseUp={() => setIsZoomOutPressed(false)}
                style={{
                  padding: '8px 12px',
                  fontSize: '1.5rem',
                  backgroundColor: isZoomOutPressed ? '#7f1616' : (isZoomOutHovered ? '#a82a2a' : '#9b1c1c'),
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, transform 0.1s ease',
                  transform: isZoomOutPressed ? 'scale(0.98)' : 'scale(1)',
                }}
              >-</button>
               <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                style={{
                  marginLeft: '20px',
                  width: '100px',
                  cursor: 'grab',
                }}
              />
            </div>
          </>
        )}
        {normTableImages.length === 0 && <p>No norm table images found.</p>}
      </div>
    </div>
  );
};

export default NormTableModal;
