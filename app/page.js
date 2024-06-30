"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Line, Circle, Image as KonvaImage } from 'react-konva';
import styled from 'styled-components';

const CaptchaContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #000080;
`;

const CaptchaCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90vw;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #000080;
  text-align: center;
  margin-bottom: 20px;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60vh;
  max-height: 500px;
  margin-bottom: 20px;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SquareOverlay = styled.div`
  position: absolute;
  border: 2px solid white;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
`;

const Button = styled.button`
  background-color: #ffa500;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
`;

const CustomCaptcha = () => {
  const [step, setStep] = useState(1);
  const [videoStream, setVideoStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [squarePosition, setSquarePosition] = useState({ x: 0, y: 0 });
  const [sectors, setSectors] = useState([]);
  const [selectedShape, setSelectedShape] = useState(null);
  const [userSelection, setUserSelection] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [imageElement, setImageElement] = useState(null);

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (step === 1) {
      initializeCamera();
    }
  }, [step]);

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(updateSquarePosition, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const updateSquarePosition = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      const squareSize = Math.min(containerWidth, containerHeight) * 0.5;
      const x = Math.random() * (containerWidth - squareSize);
      const y = Math.random() * (containerHeight - squareSize);
      setSquarePosition({ x, y, size: squareSize });
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      captureImage();
      setStep(2);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
  
    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      setImageElement(img);
      generateSectors(img.width, img.height);
    };
  };

  const generateSectors = (width, height) => {
    const sectorsPerRow = 4;
    const sectorsPerColumn = 4;
    const totalSectors = sectorsPerRow * sectorsPerColumn;
    const sectorWidth = width / sectorsPerRow;
    const sectorHeight = height / sectorsPerColumn;
    const generatedSectors = [];
  
    for (let i = 0; i < totalSectors; i++) {
      const row = Math.floor(i / sectorsPerRow);
      const col = i % sectorsPerRow;
      generatedSectors.push({
        id: i,
        x: col * sectorWidth,
        y: row * sectorHeight,
        width: sectorWidth,
        height: sectorHeight,
        shape: null,
      });
    }
  
    // Assign shapes to half of the sectors
    const shapesToAssign = Math.floor(totalSectors / 2);
    const shapes = ['triangle', 'square', 'circle'];
    for (let i = 0; i < shapesToAssign; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * totalSectors);
      } while (generatedSectors[randomIndex].shape !== null);
      generatedSectors[randomIndex].shape = shapes[Math.floor(Math.random() * shapes.length)];
    }
  
    setSectors(generatedSectors);
    setSelectedShape(shapes[Math.floor(Math.random() * shapes.length)]);
  };
  const handleSectorClick = (sectorId) => {
    setUserSelection((prev) =>
      prev.includes(sectorId)
        ? prev.filter((id) => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleValidate = () => {
    const correctSectors = sectors.filter((sector) => sector.shape === selectedShape);
    const isValid = userSelection.length === correctSectors.length &&
      userSelection.every((id) => correctSectors.some((sector) => sector.id === id));
    setValidationResult(isValid);
    setStep(3);
  };

  const renderStep1 = () => (
    <CaptchaContainer>
      <CaptchaCard>
        <Title>Take Selfie</Title>
        <ImageContainer ref={containerRef}>
          <Video ref={videoRef} autoPlay playsInline />
          <SquareOverlay
            style={{
              left: squarePosition.x,
              top: squarePosition.y,
              width: squarePosition.size,
              height: squarePosition.size,
            }}
          />
        </ImageContainer>
        <Button onClick={handleContinue}>CONTINUE</Button>
      </CaptchaCard>
    </CaptchaContainer>
  );

  const renderStep2 = () => (
    <CaptchaContainer>
      <CaptchaCard>
        <Title>Select {selectedShape}s</Title>
        <ImageContainer>
          {imageElement && (
            <Stage width={imageElement.width} height={imageElement.height}>
              <Layer>
                <KonvaImage image={imageElement} />
                {sectors.map((sector) => (
                  <React.Fragment key={sector.id}>
                    <Rect
                      x={sector.x}
                      y={sector.y}
                      width={sector.width}
                      height={sector.height}
                      stroke="white"
                      strokeWidth={1}
                      onClick={() => handleSectorClick(sector.id)}
                      fill={userSelection.includes(sector.id) ? 'rgba(255, 255, 255, 0.5)' : 'transparent'}
                    />
                    {sector.shape === 'triangle' && (
                      <Line
                        points={[
                          sector.x + sector.width / 2, sector.y,
                          sector.x, sector.y + sector.height,
                          sector.x + sector.width, sector.y + sector.height
                        ]}
                        closed
                        fill="white"
                      />
                    )}
                    {sector.shape === 'square' && (
                      <Rect
                        x={sector.x + sector.width / 4}
                        y={sector.y + sector.height / 4}
                        width={sector.width / 2}
                        height={sector.height / 2}
                        fill="white"
                      />
                    )}
                    {sector.shape === 'circle' && (
                      <Circle
                        x={sector.x + sector.width / 2}
                        y={sector.y + sector.height / 2}
                        radius={Math.min(sector.width, sector.height) / 4}
                        fill="white"
                      />
                    )}
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          )}
        </ImageContainer>
        <Button onClick={handleValidate}>VALIDATE</Button>
      </CaptchaCard>
    </CaptchaContainer>
  );

  const renderStep3 = () => (
    <CaptchaContainer>
      <CaptchaCard>
        <Title>{validationResult ? 'CAPTCHA Passed' : 'CAPTCHA Failed'}</Title>
      </CaptchaCard>
    </CaptchaContainer>
  );

  return (
    <>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </>
  );
};

export default CustomCaptcha;