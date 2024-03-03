import React, { useState, useRef, useEffect } from 'react';

export default function DigitCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [predictedDigit, setPredictedDigit] = useState(null);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const size = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = size;
      canvas.height = size;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); 
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (event) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const SendScreenshot = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
  
    fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: dataURL })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Prediction:', data.predicted_class);
      setPredictedDigit(data.predicted_class);
      clearCanvas(); // Clear canvas after submission
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  };
  

  return (
    <>
    <h1 style={{ textAlign: 'center' }}>HandWritten Digit Recognition</h1>
    <div ref={containerRef} style={{ width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{ background: 'black' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
    <div style={{ textAlign: 'center' }}>
      <button onClick={clearCanvas}>Clear</button> 
      <button onClick={SendScreenshot}>Submit</button>
    </div>
    {predictedDigit !== null && (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p>Predicted Digit: {predictedDigit}</p>
      </div>
    )}
    </>
  );
}
