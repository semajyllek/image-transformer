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
  applySegmentation
} from './utils/transformationFunctions';

const App = () => {
  // State for images and transformations
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [activeTransforms, setActiveTransforms] = useState([]);
  
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
  
  // Console log
  const [consoleLog, setConsoleLog] = useState([
    'SYSTEM INITIALIZED',
    'IMAGE MATRIX v2.5.7',
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
    { value: 'transparency', label: 'Color Transparency' }
  ];
  
  // Color scheme options
  const colorSchemeOptions = [
    { value: 'rainbow', label: 'Rainbow' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'highContrast', label: 'High Contrast' }
  ];
  
  // Simulated random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }
    }, 3000);
    
    return () => clearInterval(glitchInterval);
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
    setSelectedColor(color);
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
        contrastValue, brightnessValue, sharpnessValue, selectedColor, toleranceValue
      }
    }]);
    
    addLog(`EXECUTING: ${currentAlgorithm.toUpperCase()}_TRANSFORM`);
    
    // Trigger glitch effect
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 200);
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
            currentImageData = applyColorTransparency(currentImageData, params.selectedColor, params.toleranceValue);
          }
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
    
    // Trigger glitch effect
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 200);
  };
  
  // Save the processed image
  const saveImage = () => {
    if (processedImage) {
      addLog('EXPORTING PROCESSED IMAGE...');
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed_img.png';
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
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
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
                <div className="cyber-grid inline-block border border-blue-500 p-1">
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
                <div className="cyber-grid inline-block border border-green-500 p-1">
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
          <div>CPU: {Math.floor(Math.random() * 30) + 10}%</div>
          <div>MEM: {Math.floor(Math.random() * 40) + 60}MB</div>
          <div>PING: {Math.floor(Math.random() * 30)}ms</div>
        </div>
      </footer>
      
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
      
      {/* Random glitch effect */}
      {glitchEffect && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 101 }}>
          <div className="w-full h-2 bg-green-500 absolute" style={{ 
            top: `${Math.random() * 100}%`,
            opacity: 0.3,
            left: `-${Math.random() * 10}%`,
            width: `${100 + Math.random() * 20}%`,
          }}></div>
        </div>
      )}
      
      {/* Color Picker Modal */}
      {showColorPicker && originalImage && (
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
              <img 
                src={originalImage.src} 
                alt="Pick color" 
                onClick={(e) => {
                  // Get canvas and context
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = originalImage.width;
                  canvas.height = originalImage.height;
                  ctx.drawImage(originalImage, 0, 0);
                  
                  // Calculate position
                  const rect = e.target.getBoundingClientRect();
                  const x = Math.floor((e.clientX - rect.left) * (originalImage.width / rect.width));
                  const y = Math.floor((e.clientY - rect.top) * (originalImage.height / rect.height));
                  
                  // Get color
                  const pixel = ctx.getImageData(x, y, 1, 1).data;
                  handlePickColor({
                    r: pixel[0],
                    g: pixel[1],
                    b: pixel[2]
                  });
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