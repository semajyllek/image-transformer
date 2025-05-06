import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// Import transformation functions
import { 
  applyGrayscale, 
  applyThreshold, 
  applyInvert,
  applyContrast,
  applyBrightness,
  applySharpen,
  applyColorTransparency,
  applySobelEdgeDetection,
  applyCannyEdgeDetection,
  applySegmentation,
  applyRotation
} from './utils/transformationFunctions';

// In your App.js file, add this as a new component after the imports
const SegmentedHeaderBar = ({ title }) => {
	// Golden ratio constant
	const goldenRatio = 1.618;
	
	// Calculate segment widths following golden ratio
	const calculateSegments = () => {
	  const segments = [];
	  
	  // Calculate segments following golden ratio
	  let currentWidth = 100;
	  const minWidth = 5;
	  let tempSegments = [];
	  
	  // Generate standard segment widths
	  while (currentWidth > minWidth) {
		tempSegments.push(currentWidth);
		currentWidth = Math.floor(currentWidth / goldenRatio);
	  }
	  
	  // Get the two smallest sizes
	  const lastSize = tempSegments[tempSegments.length - 1];
	  const secondLastSize = tempSegments[tempSegments.length - 2];
	  
	  // Remove the last two from the original array to reorder them
	  tempSegments = tempSegments.slice(0, -2);
	  
	  // Add duplicates of the smallest sizes at the end (doubling quantity)
	  tempSegments.push(secondLastSize);
	  tempSegments.push(secondLastSize);
	  tempSegments.push(lastSize);
	  tempSegments.push(lastSize);
	  tempSegments.push(lastSize);
	  tempSegments.push(lastSize);
	  
	  return tempSegments;
	};
	
	const segmentWidths = calculateSegments();
	const spacing = 5; // Wider space between segments
	
	return (
	  <div className="flex text-black">
		{/* Main segment with both left and right edges flat */}
		<div 
		  className="bg-green-500 px-2 flex items-center h-6"
		  style={{ 
			flexGrow: 1,
		  }}
		>
		  <span className="font-mono">{title}</span>
		</div>
		
		{/* Wider gap */}
		<div style={{ width: `${spacing}px`, backgroundColor: 'black' }} />
		
		{/* First golden ratio segment with flat left edge */}
		<div 
		  className="bg-green-500 h-6 flex items-center justify-center"
		  style={{ 
			width: `${segmentWidths[0]}px`,
		  }}
		/>
		
		{/* Wider gap after first segment */}
		<div style={{ width: `${spacing}px`, backgroundColor: 'black' }} />
		
		{/* Remaining golden ratio segments with skew */}
		{segmentWidths.slice(1).map((width, index) => (
		  <React.Fragment key={index}>
			<div 
			  className="bg-green-500 h-6 flex items-center justify-center"
			  style={{ 
				width: `${width}px`,
				transform: 'skewX(-10deg)' // Skew for all remaining segments
			  }}
			>
			  {index === segmentWidths.length - 2 && (
				<span className="text-black">▣</span>
			  )}
			</div>
			{/* Add wider gap after each segment except the last one */}
			{index < segmentWidths.length - 2 && (
			  <div style={{ width: `${spacing}px`, backgroundColor: 'black' }} />
			)}
		  </React.Fragment>
		))}
	  </div>
	);
  };



const App = () => {
  // State for images and transformations
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  const [activeTransforms, setActiveTransforms] = useState([]);
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // State for algorithm and parameters
  const [currentAlgorithm, setCurrentAlgorithm] = useState('grayscale');
  const [thresholdValue, setThresholdValue] = useState(128);
  const [cannyLow, setCannyLow] = useState(50);
  const [cannyHigh, setCannyHigh] = useState(150);
  const [segmentTolerance, setSegmentTolerance] = useState(20);
  const [segmentMinSize, setSegmentMinSize] = useState(100);
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [contrastValue, setContrastValue] = useState(100);
  const [brightnessValue, setBrightnessValue] = useState(100);
  const [sharpnessValue, setSharpnessValue] = useState(5);
  const [toleranceValue, setToleranceValue] = useState(30);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // State for console log
  const [consoleLog, setConsoleLog] = useState([
    'SYSTEM INITIALIZED',
    'CYBERGRID IMAGE MATRIX v3.1.4',
    'QUANTUM RENDERER ONLINE',
    'NEURAL FILTERS READY',
    'AWAITING INPUT...'
  ]);
  
  // Canvas references
  const canvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  
  // Algorithm options
  const algorithmOptions = [
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'threshold', label: 'Threshold' },
    { value: 'edges', label: 'Edge Detection' },
    { value: 'canny', label: 'Canny Edge' },
    { value: 'segmentation', label: 'Segmentation' },
    { value: 'contrast', label: 'Contrast' },
    { value: 'brightness', label: 'Brightness' },
    { value: 'sharpen', label: 'Sharpen' },
    { value: 'invert', label: 'Invert Colors' },
    { value: 'transparency', label: 'Color Transparency' },
	{ value: 'rotation', label: 'Rotate Image' }
  ];
  
  // Color scheme options
  const colorSchemeOptions = [
    { value: 'rainbow', label: 'Rainbow' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'highContrast', label: 'High Contrast' }
  ];
  
  // Advanced glitch effects with keyframes
  useEffect(() => {
    // Add keyframe animations to the document
    const style = document.createElement('style');
    style.textContent = `
      @keyframes scan-line-move {
        0% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(${(Math.random() - 0.5) * 30}px) scaleY(${1 + Math.random() * 4}); }
        100% { transform: translateY(0) scaleY(1); }
      }
      
      @keyframes block-glitch {
        0% { transform: translate(-50%, -50%) skew(0deg, 0deg); }
        25% { transform: translate(-50%, -50%) skew(${(Math.random() - 0.5) * 60}deg, ${(Math.random() - 0.5) * 30}deg); }
        50% { transform: translate(-50%, -50%) skew(${(Math.random() - 0.5) * 60}deg, ${(Math.random() - 0.5) * 30}deg); }
        75% { transform: translate(-50%, -50%) skew(${(Math.random() - 0.5) * 60}deg, ${(Math.random() - 0.5) * 30}deg); }
        100% { transform: translate(-50%, -50%) skew(0deg, 0deg); }
      }
      
      @keyframes vertical-hold {
        0% { transform: translateY(0); }
        25% { transform: translateY(${(Math.random() - 0.5) * 200}px); }
        50% { transform: translateY(${(Math.random() - 0.5) * 150}px); }
        75% { transform: translateY(${(Math.random() - 0.5) * 100}px); }
        100% { transform: translateY(0); }
      }
      
      @keyframes text-displacement {
        0% { opacity: 0; transform: translate(0, 0) scale(1); }
        25% { opacity: 0.8; transform: translate(${(Math.random() - 0.5) * 50}px, ${(Math.random() - 0.5) * 50}px) scale(${0.9 + Math.random() * 0.3}); }
        75% { opacity: 0.8; transform: translate(${(Math.random() - 0.5) * 50}px, ${(Math.random() - 0.5) * 50}px) scale(${0.9 + Math.random() * 0.3}); }
        100% { opacity: 0; transform: translate(0, 0) scale(1); }
      }
      
      @keyframes wave-distortion {
        0% { background-position: 0% 0%; }
        50% { background-position: ${Math.random() * 100}% ${Math.random() * 100}%; }
        100% { background-position: 0% 0%; }
      }
    `;
    document.head.appendChild(style);
    
    // Dramatic CRT screen glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.75) {
        setGlitchEffect(true);
        setGlitchIntensity(Math.random() * 0.8 + 0.2); // Between 0.2 and 1.0
        setTimeout(() => setGlitchEffect(false), 150 + Math.random() * 350);
      }
    }, 4000);
    
    return () => {
      clearInterval(glitchInterval);
      document.head.removeChild(style);
    };
  }, []);
  
  // Add message to console log
  const addLog = (message) => {
    setConsoleLog(prev => [...prev, message]);
  };
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      addLog(`FILE_ACQUIRED: ${file.name}`);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setOriginalImage(img);
          setProcessedImage(null); // Reset processed image
          setActiveTransforms([]); // Reset transformations
          addLog(`DIMENSIONS: ${img.width}x${img.height}px`);
          addLog('IMAGE ACQUISITION COMPLETE');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle picking a color from the image
  const handlePickColor = (color) => {
    setSelectedColor({...color}); // Create a copy of the color object
    setShowColorPicker(false);
    addLog(`Selected color: RGB(${color.r}, ${color.g}, ${color.b})`);
  };
  
  // Apply transformations
  const applyTransform = () => {
    if (!originalImage) return;
    
    // Get the starting image (either original or last processed)
    const sourceCanvas = activeTransforms.length > 0 ? processedCanvasRef.current : null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    
    // Draw source image to canvas
    if (sourceCanvas) {
      ctx.drawImage(sourceCanvas, 0, 0);
    } else {
      ctx.drawImage(originalImage, 0, 0);
    }
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Process based on current algorithm
    let processedData;
    
    switch(currentAlgorithm) {
		case 'grayscale':
			processedData = applyGrayscale(imageData);
			break;
		case 'threshold':
			processedData = applyThreshold(imageData, thresholdValue);
			break;
		case 'edges':
			processedData = applySobelEdgeDetection(imageData);
			break;
		case 'canny':
			processedData = applyCannyEdgeDetection(imageData, cannyLow, cannyHigh);
			break;
		case 'segmentation':
			processedData = applySegmentation(imageData, segmentTolerance, segmentMinSize, colorScheme);
			break;
		case 'contrast':
			processedData = applyContrast(imageData, contrastValue);
			break;
		case 'brightness':
			processedData = applyBrightness(imageData, brightnessValue);
			break;
		case 'sharpen':
			processedData = applySharpen(imageData, sharpnessValue);
			break;
		case 'invert':
			processedData = applyInvert(imageData);
			break;
		case 'transparency':
			if (selectedColor) {
				processedData = applyColorTransparency(imageData, selectedColor, toleranceValue);
			} else {
				processedData = imageData; // No color selected
			}
			break;
		case 'rotation':
			processedData = applyRotation(imageData, rotationAngle);
			break;
      	default:
        	processedData = imageData;
    }
    
    // Display the result
    const processedCanvas = processedCanvasRef.current;
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const processedCtx = processedCanvas.getContext('2d');
    processedCtx.putImageData(processedData, 0, 0);
    
    setProcessedImage(processedCanvas.toDataURL('image/png'));
    
    // Add to active transforms
    const algorithm = algorithmOptions.find(a => a.value === currentAlgorithm);
    setActiveTransforms(prev => [...prev, { 
      type: currentAlgorithm, 
      label: algorithm ? algorithm.label : currentAlgorithm,
      params: { 
        thresholdValue, cannyLow, cannyHigh, segmentTolerance, colorScheme,
        contrastValue, brightnessValue, sharpnessValue, 
        selectedColor: selectedColor ? {...selectedColor} : null, // Create a deep copy of the color object
        toleranceValue, rotationAngle
      }
    }]);
    
    addLog(`EXECUTING: ${currentAlgorithm.toUpperCase()}_TRANSFORM`);
    
    // Trigger enhanced glitch effect
    setGlitchEffect(true);
    setGlitchIntensity(Math.random() * 0.6 + 0.4); // Between 0.4 and 1.0
    setTimeout(() => setGlitchEffect(false), 300);
  };
  
  // Remove a transformation and reprocess the image
  const removeTransform = (index) => {
    addLog(`REMOVING: ${activeTransforms[index].type.toUpperCase()}_TRANSFORM`);
    
    // Update active transforms by removing the specified transform
    setActiveTransforms(prev => prev.filter((_, i) => i !== index));
    
    // Reapply all remaining transforms from scratch
    reapplyAllTransforms(index);
  };
  
  // Reapply all transformations from the beginning up to a specific index
  const reapplyAllTransforms = (removedIndex) => {
    if (!originalImage) return;
    
    // Start with the original image
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    ctx.drawImage(originalImage, 0, 0);
    
    // Get initial image data
    let currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Filter out the transform to be removed
    const remainingTransforms = activeTransforms.filter((_, i) => i !== removedIndex);
    
    // If no transforms left, reset to original image
    if (remainingTransforms.length === 0) {
      setProcessedImage(null);
      return;
    }
    
    // Apply each transform in sequence
    for (let i = 0; i < remainingTransforms.length; i++) {
      const transform = remainingTransforms[i];
      const params = transform.params;
      
      // Apply the appropriate transformation
      switch(transform.type) {
        case 'grayscale':
          currentImageData = applyGrayscale(currentImageData);
          break;
        case 'threshold':
          currentImageData = applyThreshold(currentImageData, params.thresholdValue);
          break;
        case 'edges':
          currentImageData = applySobelEdgeDetection(currentImageData);
          break;
        case 'canny':
          currentImageData = applyCannyEdgeDetection(currentImageData, params.cannyLow, params.cannyHigh);
          break;
        case 'segmentation':
          currentImageData = applySegmentation(currentImageData, params.segmentTolerance, params.segmentMinSize, params.colorScheme);
          break;
        case 'contrast':
          currentImageData = applyContrast(currentImageData, params.contrastValue);
          break;
        case 'brightness':
          currentImageData = applyBrightness(currentImageData, params.brightnessValue);
          break;
        case 'sharpen':
          currentImageData = applySharpen(currentImageData, params.sharpnessValue);
          break;
        case 'invert':
          currentImageData = applyInvert(currentImageData);
          break;
        case 'transparency':
          if (params.selectedColor) {
            // Use a deep copy of the color to avoid reference issues
            const colorCopy = {...params.selectedColor};
            currentImageData = applyColorTransparency(currentImageData, colorCopy, params.toleranceValue);
          }
          break;

		case 'rotation':
			currentImageData = applyRotation(currentImageData, params.rotationAngle);
			break;
        default:
          // Do nothing for unknown transforms
          break;
      }
      
      addLog(`REAPPLYING: ${transform.type.toUpperCase()}_TRANSFORM`);
    }
    
    // Display the final result
    const processedCanvas = processedCanvasRef.current;
    processedCanvas.width = canvas.width;
    processedCanvas.height = canvas.height;
    const processedCtx = processedCanvas.getContext('2d');
    processedCtx.putImageData(currentImageData, 0, 0);
    
    setProcessedImage(processedCanvas.toDataURL('image/png'));
    
    // Trigger enhanced glitch effect
    setGlitchEffect(true);
    //setGlitchType(['horizontal', 'pixelate', 'chromatic', 'noise', 'flicker'][Math.floor(Math.random() * 5)]);
    setGlitchIntensity(Math.random() * 0.6 + 0.4); // Between 0.4 and 1.0
    setTimeout(() => setGlitchEffect(false), 300);
  };
  
  // Save the processed image
  const saveImage = () => {
    if (processedImage) {
      addLog('EXPORTING PROCESSED IMAGE...');
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog('FILE SAVED SUCCESSFULLY');
    }
  };
  
  // Reset all transformations
  const resetAll = () => {
    setActiveTransforms([]);
    setProcessedImage(null);
    setCurrentAlgorithm('grayscale');
    setThresholdValue(128);
    setCannyLow(50);
    setCannyHigh(150);
    setSegmentTolerance(20);
    setSegmentMinSize(100);
    setColorScheme('rainbow');
    setContrastValue(100);
    setBrightnessValue(100);
    setSharpnessValue(5);
    setToleranceValue(30);
    setSelectedColor(null);
	setRotationAngle(0);
    addLog('SYSTEM RESET COMPLETE');
  };

  // Render the parameter controls based on current algorithm
  const renderParameterControls = () => {
    switch(currentAlgorithm) {
		case 'threshold':
			return (
				<div>
					<div className="flex justify-between text-xs mb-1">
					<span>Threshold Value: {thresholdValue}</span>
					<span>[0:255]</span>
				</div>
				<input
					type="range"
					min="0"
					max="255"
					value={thresholdValue}
					onChange={(e) => setThresholdValue(parseInt(e.target.value))}
					className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
				/>
				</div>
			);
        
		case 'rotation':
			return (
			  <div>
				<div className="flex justify-between text-xs mb-1">
				  <span>Rotation Angle: {rotationAngle}°</span>
				  <span>[-180:180]</span>
				</div>
				<input
				  type="range"
				  min="-180"
				  max="180"
				  value={rotationAngle}
				  onChange={(e) => setRotationAngle(parseInt(e.target.value))}
				  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
				/>
				<div className="flex justify-between mt-2">
				  <button
					onClick={() => setRotationAngle(rotationAngle - 90)}
					className="px-2 py-1 text-xs bg-black hover:bg-gray-800 text-green-400 border border-green-500"
				  >
					-90°
				  </button>
				  <button
					onClick={() => setRotationAngle(0)}
					className="px-2 py-1 text-xs bg-black hover:bg-gray-800 text-green-400 border border-green-500"
				  >
					Reset
				  </button>
				  <button
					onClick={() => setRotationAngle(rotationAngle + 90)}
					className="px-2 py-1 text-xs bg-black hover:bg-gray-800 text-green-400 border border-green-500"
				  >
					+90°
				  </button>
				</div>
			  </div>
			);

      case 'canny':
        return (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Low Threshold: {cannyLow}</span>
                <span>[0:255]</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={cannyLow}
                onChange={(e) => setCannyLow(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>High Threshold: {cannyHigh}</span>
                <span>[0:255]</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={cannyHigh}
                onChange={(e) => setCannyHigh(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </>
        );
        
      case 'segmentation':
        return (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Segment Tolerance: {segmentTolerance}</span>
                <span>[5:50]</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={segmentTolerance}
                onChange={(e) => setSegmentTolerance(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Minimum Segment Size: {segmentMinSize}</span>
                <span>[10:500]</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={segmentMinSize}
                onChange={(e) => setSegmentMinSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div className="mb-2">
              <div className="text-xs mb-1">Color Scheme:</div>
              <div className="relative">
                <select
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="w-full bg-black text-green-400 border border-green-500 py-1 px-2 text-xs appearance-none"
                >
                  {colorSchemeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </>
        );
      
      case 'contrast':
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Contrast: {contrastValue}</span>
              <span>[0:200]</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={contrastValue}
              onChange={(e) => setContrastValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        );
        
      case 'brightness':
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Brightness: {brightnessValue}</span>
              <span>[0:200]</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={brightnessValue}
              onChange={(e) => setBrightnessValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        );
        
      case 'sharpen':
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>Sharpness: {sharpnessValue}</span>
              <span>[0:10]</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={sharpnessValue}
              onChange={(e) => setSharpnessValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        );
      
      case 'transparency':
        return (
          <>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Tolerance: {toleranceValue}</span>
                <span>[0:100]</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={toleranceValue}
                onChange={(e) => setToleranceValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            <div className="mt-3">
              <div className="text-xs mb-1">Selected Color:</div>
              {selectedColor ? (
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 border border-gray-600 mr-2" 
                    style={{ 
                      backgroundColor: `rgb(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})` 
                    }}
                  />
                  <span className="text-xs">
                    RGB({selectedColor.r}, {selectedColor.g}, {selectedColor.b})
                  </span>
                </div>
              ) : (
                <div className="text-xs text-red-400">No color selected</div>
              )}
            </div>
            <button
              onClick={() => setShowColorPicker(true)}
              className="mt-2 px-3 py-1 text-xs bg-black hover:bg-gray-800 text-green-400 border border-green-500"
            >
              Pick Color from Image
            </button>
          </>
        );
        
      default:
        return (
          <div className="text-green-500 text-xs py-2">
            No parameters required for this transform
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Header */}
      <header className="border-b border-green-500 p-4 mb-0">
        <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Removed colored dots */}
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-center uppercase flex-1">
          Image Transformer
        </h1>
        <div className="text-xs">
          <div className="animate-pulse">[SYSTEM ACTIVE]</div>
        </div>
      </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-col md:flex-row">
        {/* Left panel - controls */}
        <div className="w-full md:w-2/5 bg-gray-900 border-r border-green-500">
          <div className="border-b border-green-500 relative">
            <div className="bg-green-500 text-black px-2 flex justify-between">
              <span>COMMAND_INTERFACE</span>
              <span>█</span>
            </div>
            
            <div className="p-4">
              {/* Console Log */}
              <div className="bg-black border border-green-500 p-2 h-32 overflow-auto text-xs mb-4">
                {consoleLog.map((log, index) => (
                  <div key={index} className="text-green-400">
                    <span className="text-green-600">{'>'}</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* File Acquisition */}
          <div className="border-b border-green-500">
            <div className="bg-gray-800 text-green-400 px-2 py-1">
              {'> FILE_ACQUISITION'}
            </div>
            <div className="p-2">
              <label className="flex justify-center px-4 py-2 bg-black hover:bg-gray-800 text-green-400 border border-green-500 cursor-pointer">
                <span className="text-xs">[ SELECT TARGET IMAGE ]</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          
          {/* Algorithm Selection - Only show if image is loaded */}
          {originalImage && (
            <div className="border-b border-green-500">
              <div className="bg-gray-800 text-green-400 px-2 py-1">
                {'> SELECT_ALGORITHM'}
              </div>
              <div className="p-2">
                <div className="relative">
                  <select
                    value={currentAlgorithm}
                    onChange={(e) => setCurrentAlgorithm(e.target.value)}
                    className="w-full bg-black text-green-400 border border-green-500 p-2 appearance-none"
                  >
                    {algorithmOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Algorithm Parameters - Only show if image is loaded */}
          {originalImage && (
            <div className="border-b border-green-500">
              <div className="bg-gray-800 text-green-400 px-2 py-1">
                {'> ALGORITHM_PARAMETERS'}
              </div>
              <div className="p-4 bg-gray-900">
                {renderParameterControls()}
              </div>
            </div>
          )}
          
          {/* Execute Transform Button - Only show if image is loaded */}
          {originalImage && (
            <div className="border-b border-green-500">
              <button
                onClick={applyTransform}
                disabled={currentAlgorithm === 'transparency' && !selectedColor}
                className="w-full py-2 bg-black text-green-400 hover:bg-gray-800 border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                [ EXECUTE_TRANSFORM ]
              </button>
            </div>
          )}
          
          {/* Active Transforms - Only show if there are active transforms */}
          {activeTransforms.length > 0 && (
            <div>
              <div className="bg-gray-800 text-green-400 px-2 py-1">
                {'> ACTIVE_TRANSFORMS'}
              </div>
              <div className="p-2">
                {activeTransforms.map((transform, index) => (
                  <div key={index} className="flex justify-between bg-black border border-green-500 p-2 mb-2">
                    <span className="text-xs">{index + 1} :: {transform.label}</span>
                    <button
                      onClick={() => removeTransform(index)}
                      className="text-red-500 border border-red-500 px-1 text-xs"
                    >
                      [X]
                    </button>
                  </div>
                ))}
                
                {/* Reset all button */}
                {activeTransforms.length > 0 && (
                  <button
                    onClick={resetAll}
                    className="w-full mt-2 py-2 bg-black text-red-400 hover:bg-red-900 border border-red-500"
                  >
                    [ RESET_SYSTEM ]
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right panel - images */}
        <div className="w-full md:w-3/5">
          {/* Original Image */}
          <div className="border-b border-blue-500 relative">
            <div className="bg-blue-500 text-black px-2 flex justify-between">
              <span>SOURCE_MATRIX</span>
              <span>▣</span>
            </div>
            
            <div className="flex items-center justify-center bg-gray-900 p-4" style={{ minHeight: '250px' }}>
              <canvas ref={canvasRef} className="hidden" />
              
              {originalImage ? (
                <div className="grid inline-block border border-blue-500 p-1">
                  <img 
                    src={originalImage.src} 
                    alt="Original" 
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: '250px' }}
                  />
                </div>
              ) : (
                <div className="border border-dashed border-blue-500 p-8 text-center">
                  <div className="text-blue-400">NO_INPUT_DETECTED</div>
                  <div className="text-xs text-blue-300 mt-2">WAITING FOR TARGET IMAGE</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Processed Image */}
          <div className="border-b border-green-500 relative">
            <div className="bg-green-500 text-black px-2 flex justify-between">
              <span>PROCESSED_OUTPUT</span>
              <span>▣</span>
            </div>
            
            <div className="flex items-center justify-center bg-gray-900 p-4 relative" style={{ minHeight: '250px' }}>
              <canvas ref={processedCanvasRef} className="hidden" />
              
              {processedImage ? (
                <div className="grid inline-block border border-green-500 p-1">
                  <img 
                    src={processedImage} 
                    alt="Processed" 
                    className="max-w-full h-auto mx-auto"
                    style={{ maxHeight: '250px' }}
                  />
                </div>
              ) : (
                <div className="border border-dashed border-green-500 p-8 text-center">
                  <div className="text-green-400">NO_TRANSFORMS_APPLIED</div>
                  <div className="text-xs text-green-300 mt-2">EXECUTE TRANSFORM ALGORITHM</div>
                </div>
              )}
              
              {processedImage && (
                <button
                  onClick={saveImage}
                  className="absolute bottom-2 right-2 px-4 py-1 bg-black text-green-400 border border-green-500 text-xs hover:bg-gray-800"
                >
                  [ EXPORT_IMAGE ]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-green-500 p-2 text-xs flex justify-between">
        <div>SYS.STATUS: OPERATIONAL</div>
        <div className="flex gap-4">
          <div className="text-xs animate-pulse">[SYSTEM ACTIVE]</div>
        </div>
      </footer>
      
      {/* Advanced glitch effects */}
      {glitchEffect && (
        <>
          {/* CRT screen failure effects */}
          <div className="fixed inset-0 pointer-events-none" style={{ 
            zIndex: 101,
            backdropFilter: Math.random() > 0.7 ? `hue-rotate(${Math.random() * 180}deg)` : 'none',
            animation: `crt-flicker ${0.05 + Math.random() * 0.2}s ease-in-out`,
            background: `
              linear-gradient(${Math.random() * 360}deg, 
                rgba(0,255,0,${Math.random() * 0.1}) 0%, 
                transparent ${10 + Math.random() * 20}%, 
                rgba(255,0,0,${Math.random() * 0.1}) ${40 + Math.random() * 20}%,
                transparent ${60 + Math.random() * 20}%,
                rgba(0,0,255,${Math.random() * 0.1}) 100%)
            `,
            boxShadow: `0 0 ${glitchIntensity * 100}px rgba(255,255,255,0.1) inset`,
            mixBlendMode: 'overlay'
          }}></div>
          
          {/* Distortion wave */}
          <div className="fixed inset-0 pointer-events-none" style={{ 
            zIndex: 102,
            backgroundImage: `repeating-linear-gradient(
              ${Math.random() * 360}deg,
              rgba(0,255,0,${0.05 + Math.random() * 0.1}) 0%,
              transparent 1%,
              transparent 2%,
              rgba(255,0,0,${0.05 + Math.random() * 0.1}) 3%,
              transparent 4%
            )`,
            backgroundSize: `${100 + Math.random() * 200}% ${100 + Math.random() * 200}%`,
            animation: `wave-distortion ${0.2 + Math.random() * 0.5}s ease-in-out`,
            opacity: 0.7 * glitchIntensity,
            transform: `scale(${1 + Math.random() * 0.1}, ${1 + Math.random() * 0.2}) skewX(${(Math.random() - 0.5) * 10}deg)`,
            mixBlendMode: 'overlay'
          }}></div>
          
          {/* Horizontal scan line failure (multiple lines) */}
          {[...Array(5 + Math.floor(glitchIntensity * 10))].map((_, i) => (
            <div key={i} className="fixed pointer-events-none" style={{ 
              zIndex: 103,
              height: `${1 + Math.random() * 5}px`,
              top: `${Math.random() * 100}%`,
              left: 0,
              right: 0,
              opacity: 0.7,
              backgroundColor: `rgba(255,255,255,${0.4 + Math.random() * 0.6})`,
              transform: `translateY(${(Math.random() - 0.5) * 10}px) scaleY(${1 + Math.random() * 3})`,
              mixBlendMode: 'overlay',
              filter: `blur(${Math.random() * 0.5}px) brightness(${1 + Math.random() * 2})`,
              animation: `scan-line-move ${0.05 + Math.random() * 0.2}s linear ${Math.random() * 0.2}s`
            }}></div>
          ))}
          
          {/* Random blocks of distortion */}
          {[...Array(Math.floor(glitchIntensity * 4))].map((_, i) => (
            <div key={`block-${i}`} className="fixed pointer-events-none" style={{ 
              zIndex: 104,
              height: `${10 + Math.random() * 40}px`,
              width: `${20 + Math.random() * 200}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `translate(-50%, -50%) skew(${(Math.random() - 0.5) * 40}deg, ${(Math.random() - 0.5) * 20}deg)`,
              backgroundColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},${0.1 + Math.random() * 0.2})`,
              boxShadow: `0 0 ${10 + Math.random() * 20}px rgba(255,255,255,0.5)`,
              mixBlendMode: 'overlay',
              animation: `block-glitch ${0.05 + Math.random() * 0.15}s ease-in-out infinite`
            }}></div>
          ))}
          
          {/* Text displacement effect */}
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ 
            zIndex: 105,
            opacity: Math.random() > 0.7 ? 0.8 : 0,
            animation: `text-displacement ${0.1 + Math.random() * 0.15}s ease-in-out`
          }}>
            <div className="text-green-500 font-mono text-2xl font-bold tracking-wider" 
              style={{
                textShadow: `
                  ${(Math.random() - 0.5) * 20}px ${(Math.random() - 0.5) * 20}px 5px rgba(255,0,0,0.7),
                  ${(Math.random() - 0.5) * 20}px ${(Math.random() - 0.5) * 20}px 5px rgba(0,255,0,0.7),
                  ${(Math.random() - 0.5) * 20}px ${(Math.random() - 0.5) * 20}px 5px rgba(0,0,255,0.7)
                `,
                transform: `translate(${(Math.random() - 0.5) * 30}px, ${(Math.random() - 0.5) * 30}px)`,
                filter: `blur(${Math.random() * 2}px)`
              }}>
              {Math.random() > 0.5 ? 'SIGNAL LOSS' : 'SYSTEM ERROR'}
            </div>
          </div>
          
          {/* Vertical hold effect */}
          {Math.random() > 0.5 && (
            <div className="fixed inset-0 pointer-events-none" style={{ 
              zIndex: 106,
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgba(0,0,0,${0.3 * glitchIntensity}) ${50 - glitchIntensity * 20}%, 
                transparent ${50 + glitchIntensity * 20}%, 
                transparent 100%)`,
              animation: `vertical-hold ${0.1 + Math.random() * 0.2}s ease-in-out`,
              transform: `translateY(${(Math.random() - 0.5) * 100}px)`,
              mixBlendMode: 'darken'
            }}></div>
          )}
        </>
      )}
          
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
        backgroundSize: '100% 2px',
        opacity: 0.3,
        zIndex: 100
      }}></div>
      
      {/* CRT screen effect */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.5) 150%)',
        zIndex: 99
      }}></div>
      
      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-green-500 p-4 max-w-3xl max-h-full overflow-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-green-400">Pick a color from the image</h3>
              <button 
                onClick={() => setShowColorPicker(false)}
                className="text-red-500 border border-red-500 px-2"
              >
                [X]
              </button>
            </div>
            
            <div className="relative cursor-crosshair">
              {/* Use the processed image if available, otherwise use the original image */}
              <img 
                src={processedImage || (originalImage ? originalImage.src : '')} 
                alt="Pick color" 
                onClick={(e) => {
                  // Get canvas and context
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  
                  // Use the processed image for the color picker if it exists
                  const sourceImage = new Image();
                  sourceImage.onload = () => {
                    // Set canvas dimensions to match the source image
                    canvas.width = sourceImage.width;
                    canvas.height = sourceImage.height;
                    ctx.drawImage(sourceImage, 0, 0);
                    
                    // Calculate position
                    const rect = e.target.getBoundingClientRect();
                    const x = Math.floor((e.clientX - rect.left) * (sourceImage.width / rect.width));
                    const y = Math.floor((e.clientY - rect.top) * (sourceImage.height / rect.height));
                    
                    // Get color
                    const pixel = ctx.getImageData(x, y, 1, 1).data;
                    handlePickColor({
                      r: pixel[0],
                      g: pixel[1],
                      b: pixel[2]
                    });
                  };
                  
                  // Set the source image to either the processed image or the original
                  sourceImage.src = processedImage || originalImage.src;
                }}
                className="max-w-full max-h-[70vh] border border-gray-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;