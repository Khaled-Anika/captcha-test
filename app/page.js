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
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #000080;
  text-align: center;
  margin-bottom: 20px;
`;

const ImageContainer = styled.div`
  position: relative;
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
  const [selectedColor, setSelectedColor] = useState(null);
  const [userSelection, setUserSelection] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [imageElement, setImageElement] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);

  const videoRef = useRef(null);

  const isTestEnvironment = process.env.NODE_ENV === 'test';

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
    if (step === 2) {
      setStartTime(Date.now());
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
    const videoWidth = videoRef.current?.offsetWidth || 360;
    const videoHeight = videoRef.current?.offsetHeight || 300;
    const squareSize = Math.min(videoWidth, videoHeight) * 0.5;
    const x = Math.random() * (videoWidth - squareSize);
    const y = Math.random() * (videoHeight - squareSize);
    setSquarePosition({ x, y, size: squareSize });
  };

  const handleContinue = () => {
    if (step === 1) {
      captureImage();
      setStep(2);
    }
  };

  const applyImageDistortion = (canvas) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));     // Red
      data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise)); // Green
      data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise)); // Blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const captureImage = () => {
    if (isTestEnvironment) {
      // Skip image capture and distortion in test environment
      setCapturedImage('test-image-url');
      setImageDimensions({ width: 400, height: 300 });
      generateSectors();
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const aspectRatio = video.videoWidth / video.videoHeight;
    const width = video.offsetWidth;
    const height = width / aspectRatio;
  
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Apply distortion
    applyImageDistortion(canvas);
    
    const imageDataUrl = canvas.toDataURL('image/png');
    setCapturedImage(imageDataUrl);
    setImageDimensions({ width, height });

    const img = new Image();
    img.src = imageDataUrl;
    img.onload = () => {
      setImageElement(img);
    };

    generateSectors();
  };

  const getRandomColor = () => {
    const colors = ['red', 'green', 'blue'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomShape = () => {
    const shapes = ['triangle', 'square', 'circle'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };

  const generateSectors = () => {
    const sectorSize = 30;
    const sectorsPerRow = 4;
    const sectorsPerColumn = 4;
    const generatedSectors = [];

    for (let i = 0; i < sectorsPerRow * sectorsPerColumn; i++) {
      const row = Math.floor(i / sectorsPerRow);
      const col = i % sectorsPerRow;
      const shape = Math.random() < 0.5 ? getRandomShape() : null;
      const color = shape ? getRandomColor() : null;
      generatedSectors.push({
        id: i,
        x: squarePosition.x + col * sectorSize,
        y: squarePosition.y + row * sectorSize,
        shape,
        color,
      });
    }
    setSectors(generatedSectors);
    const randomSector = generatedSectors.find(sector => sector.shape && sector.color);
    setSelectedShape(randomSector.shape);
    setSelectedColor(randomSector.color);
  };

  const handleSectorClick = (sectorId) => {
    setUserSelection((prev) =>
      prev.includes(sectorId)
        ? prev.filter((id) => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleValidate = () => {
    const solveTime = Date.now() - startTime;
    let isValid = false;

    if (solveTime < 2000 || solveTime > 20000) {
      setValidationResult(false);
    } else {
      const correctSectors = sectors.filter((sector) => 
        sector.shape === selectedShape && sector.color === selectedColor
      );
      isValid = userSelection.length === correctSectors.length &&
        userSelection.every((id) => correctSectors.some((sector) => sector.id === id));
      setValidationResult(isValid);
    }

    if (!isValid) {
      setAttempts(attempts + 1);
      if (attempts >= 2) {
        setBlocked(true);
      }
    }

    setStep(3);
  };

  const handleRetry = () => {
    if (blocked) {
      return;
    }
    setStep(1);
    setUserSelection([]);
    setValidationResult(null);
    setStartTime(null);
  };

  const renderStep1 = () => (
    <CaptchaContainer>
      <CaptchaCard>
        <Title>Take Selfie</Title>
        <ImageContainer>
          <Video ref={videoRef} autoPlay playsInline />
          <SquareOverlay
            style={{
              left: squarePosition.x,
              top: squarePosition.y,
              width: 120,
              height: 120,
            }}
          />
        </ImageContainer>
        <Button data-role="button" onClick={handleContinue}>CONTINUE</Button>
      </CaptchaCard>
    </CaptchaContainer>
  );

  const renderStep2 = () => (
    <CaptchaContainer>
      <CaptchaCard>
        <Title>Select {selectedColor} {selectedShape}s</Title>
        <ImageContainer>
          <Stage width={imageDimensions.width} height={imageDimensions.height} data-testid="captcha-stage">
            <Layer>
              {imageElement && (
                <KonvaImage
                  image={imageElement}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                />
              )}
              <Rect
                x={squarePosition.x}
                y={squarePosition.y}
                width={120}
                height={120}
                stroke="white"
                strokeWidth={2}
              />
              {sectors.map((sector) => (
                <React.Fragment key={sector.id}>
                  <Rect
                    x={sector.x}
                    y={sector.y}
                    width={30}
                    height={30}
                    stroke="white"
                    strokeWidth={1}
                    data-testid="grid-item"
                    onClick={() => handleSectorClick(sector.id)}
                    fill={userSelection.includes(sector.id) ? 'rgba(255, 255, 255, 0.5)' : 'transparent'}
                  />
                  {sector.shape === 'circle' && (
                    <Circle x={sector.x + 15} y={sector.y + 15} radius={10} fill={sector.color} />
                  )}
                  {sector.shape === 'square' && (
                    <Rect x={sector.x + 5} y={sector.y + 5} width={20} height={20} fill={sector.color} />
                  )}
                  {sector.shape === 'triangle' && (
                    <Line
                      points={[sector.x + 15, sector.y + 5, sector.x + 5, sector.y + 25, sector.x + 25, sector.y + 25]}
                      closed
                      fill={sector.color}
                    />
                  )}
                </React.Fragment>
              ))}
            </Layer>
          </Stage>
        </ImageContainer>
        <Button data-role="button" onClick={handleValidate}>VALIDATE</Button>
      </CaptchaCard>
    </CaptchaContainer>
  );

  const renderStep3 = () => (
    <CaptchaContainer>
      <CaptchaCard>
        <Title style={{marginBottom: 0}}>{validationResult ? 'CAPTCHA Passed' : 'CAPTCHA Failed'}</Title>
        {!validationResult && !blocked && (
          <Button data-role="button" className='common-margin' onClick={handleRetry}>RETRY</Button>
        )}
        {blocked && (
          <p className='common-margin block-text'>You have been blocked from further attempts.</p>
        )}
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