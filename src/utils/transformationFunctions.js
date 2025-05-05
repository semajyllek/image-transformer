import { hsvToRgb } from './colorUtils';

/**
 * This file contains image transformation functions extracted from the original repository
 */

/**
 * Converts an image to grayscale
 * 
 * @param {ImageData} imageData - The image data to process
 * @returns {ImageData} The processed grayscale image data
 */
export const applyGrayscale = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate luminance using perceptual factors
    const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    
    // Set all RGB channels to the same grayscale value
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
    // Alpha channel remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Applies threshold filter to an image
 * Converts to binary black and white based on threshold
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} threshold - Threshold value (0-255)
 * @returns {ImageData} The processed image data
 */
export const applyThreshold = (imageData, threshold) => {
  // First convert to grayscale
  const grayscaleData = applyGrayscale(imageData);
  const data = grayscaleData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply threshold: set to black or white
    const value = data[i] < threshold ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    // Alpha channel remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Inverts the colors of an image
 * 
 * @param {ImageData} imageData - The image data to process
 * @returns {ImageData} The processed image data with inverted colors
 */
export const applyInvert = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    // Invert RGB channels
    data[i] = 255 - data[i];
    data[i + 1] = 255 - data[i + 1];
    data[i + 2] = 255 - data[i + 2];
    // Alpha channel remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Adjusts the contrast of an image
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} contrast - Contrast value (0-200), where 100 is unchanged
 * @returns {ImageData} The processed image data
 */
export const applyContrast = (imageData, contrast) => {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply contrast adjustment to RGB channels
    data[i] = clamp(factor * (data[i] - 128) + 128);
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    // Alpha channel remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Adjusts the brightness of an image
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} brightness - Brightness value (0-200), where 100 is unchanged
 * @returns {ImageData} The processed image data
 */
export const applyBrightness = (imageData, brightness) => {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = brightness / 100;
  
  for (let i = 0; i < data.length; i += 4) {
    // Apply brightness adjustment to RGB channels
    data[i] = clamp(data[i] * factor);
    data[i + 1] = clamp(data[i + 1] * factor);
    data[i + 2] = clamp(data[i + 2] * factor);
    // Alpha channel remains unchanged
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Applies sharpening filter to an image
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} amount - Sharpening intensity (0-10)
 * @returns {ImageData} The processed image data
 */
export const applySharpen = (imageData, amount) => {
  // If amount is 0, return the original image data
  if (amount === 0) return imageData;
  
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const factor = amount / 10;
  
  // Create a new array for the result
  const resultData = new Uint8ClampedArray(data);
  
  // Sharpen kernel
  const kernel = [
    0, -factor, 0,
    -factor, 1 + 4 * factor, -factor,
    0, -factor, 0
  ];
  
  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      // Process each color channel
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        
        // Apply the kernel
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            const dataIndex = ((y + ky) * width + (x + kx)) * 4 + c;
            sum += data[dataIndex] * kernel[kernelIndex];
          }
        }
        
        resultData[pixelIndex + c] = clamp(sum);
      }
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Makes a specific color transparent
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {Object} color - The color to make transparent {r, g, b}
 * @param {number} tolerance - How similar colors must be to become transparent (0-255)
 * @returns {ImageData} The processed image data
 */
export const applyColorTransparency = (imageData, color, tolerance) => {
  const data = new Uint8ClampedArray(imageData.data);
  
  for (let i = 0; i < data.length; i += 4) {
    // Calculate color distance
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const colorDistance = Math.sqrt(
      Math.pow(r - color.r, 2) +
      Math.pow(g - color.g, 2) +
      Math.pow(b - color.b, 2)
    );
    
    // If color is within tolerance, make it transparent
    if (colorDistance <= tolerance) {
      data[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }
  
  return new ImageData(data, imageData.width, imageData.height);
};

/**
 * Applies Sobel edge detection algorithm to an image
 * Uses horizontal and vertical gradient kernels to detect edges
 * 
 * @param {ImageData} imageData - The image data to process
 * @returns {ImageData} The processed image data with edges highlighted
 */
export const applySobelEdgeDetection = (imageData) => {
  // First convert to grayscale
  const grayscaleData = applyGrayscale(imageData);
  const data = grayscaleData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Create a new array for the result
  const resultData = new Uint8ClampedArray(data.length);
  
  // Sobel kernels
  const kernelX = [
    -1, 0, 1,
    -2, 0, 2,
    -1, 0, 1
  ];
  
  const kernelY = [
    -1, -2, -1,
     0,  0,  0,
     1,  2,  1
  ];
  
  // Apply convolution
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      let sumX = 0;
      let sumY = 0;
      
      // Apply kernel to neighboring pixels
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const kernelIndex = (ky + 1) * 3 + (kx + 1);
          const dataIndex = ((y + ky) * width + (x + kx)) * 4;
          
          sumX += data[dataIndex] * kernelX[kernelIndex];
          sumY += data[dataIndex] * kernelY[kernelIndex];
        }
      }
      
      // Calculate gradient magnitude
      const magnitude = Math.sqrt(sumX * sumX + sumY * sumY);
      
      // Set the result pixel
      resultData[pixelIndex] = magnitude;
      resultData[pixelIndex + 1] = magnitude;
      resultData[pixelIndex + 2] = magnitude;
      resultData[pixelIndex + 3] = 255; // Full opacity
    }
  }
  
  // Handle border pixels (leave them as black)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Skip non-border pixels
      if (x !== 0 && x !== width - 1 && y !== 0 && y !== height - 1) {
        continue;
      }
      
      const pixelIndex = (y * width + x) * 4;
      resultData[pixelIndex] = 0;
      resultData[pixelIndex + 1] = 0;
      resultData[pixelIndex + 2] = 0;
      resultData[pixelIndex + 3] = 255;
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Applies Canny edge detection algorithm to an image
 * More advanced edge detection with multi-stage processing
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} lowThreshold - Lower threshold for edge detection
 * @param {number} highThreshold - Higher threshold for edge detection
 * @returns {ImageData} The processed image data with edges highlighted
 */
export const applyCannyEdgeDetection = (imageData, lowThreshold, highThreshold) => {
  // Step 1: Apply Gaussian blur (simplified - using a negative sharpening as blur)
  const blurredData = applyGaussianBlur(imageData);
  
  // Step 2: Apply Sobel operators
  const sobelData = applySobelEdgeDetection(blurredData);
  
  // Step 3: Non-maximum suppression and edge tracking
  const width = imageData.width;
  const height = imageData.height;
  const data = sobelData.data;
  const resultData = new Uint8ClampedArray(data.length);
  
  // Apply double threshold
  for (let i = 0; i < data.length; i += 4) {
    const magnitude = data[i];
    
    if (magnitude > highThreshold) {
      // Strong edge
      resultData[i] = 255;
      resultData[i + 1] = 255;
      resultData[i + 2] = 255;
    } else if (magnitude > lowThreshold) {
      // Weak edge
      resultData[i] = 128;
      resultData[i + 1] = 128;
      resultData[i + 2] = 128;
    } else {
      // Not an edge
      resultData[i] = 0;
      resultData[i + 1] = 0;
      resultData[i + 2] = 0;
    }
    
    resultData[i + 3] = 255; // Full opacity
  }
  
  // Apply hysteresis (connecting weak edges to strong ones)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      // Only process weak edges
      if (resultData[pixelIndex] === 128) {
        let hasStrongNeighbor = false;
        
        // Check 8-connected neighborhood
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            if (ky === 0 && kx === 0) continue; // Skip center pixel
            
            const neighborIndex = ((y + ky) * width + (x + kx)) * 4;
            if (resultData[neighborIndex] === 255) {
              hasStrongNeighbor = true;
              break;
            }
          }
          if (hasStrongNeighbor) break;
        }
        
        // If connected to a strong edge, make this a strong edge
        // Otherwise, remove this weak edge
        if (hasStrongNeighbor) {
          resultData[pixelIndex] = 255;
          resultData[pixelIndex + 1] = 255;
          resultData[pixelIndex + 2] = 255;
        } else {
          resultData[pixelIndex] = 0;
          resultData[pixelIndex + 1] = 0;
          resultData[pixelIndex + 2] = 0;
        }
      }
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Applies a simple Gaussian blur to an image
 * Used as a preprocessing step for Canny edge detection
 * 
 * @param {ImageData} imageData - The image data to process
 * @returns {ImageData} The blurred image data
 */
const applyGaussianBlur = (imageData) => {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const resultData = new Uint8ClampedArray(data);
  
  // Gaussian kernel (5x5)
  const kernel = [
    2, 4, 5, 4, 2,
    4, 9, 12, 9, 4,
    5, 12, 15, 12, 5,
    4, 9, 12, 9, 4,
    2, 4, 5, 4, 2
  ];
  
  // Normalize the kernel
  const kernelSum = kernel.reduce((sum, val) => sum + val, 0);
  const normalizedKernel = kernel.map(val => val / kernelSum);
  
  // Apply convolution with Gaussian kernel
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      const pixelIndex = (y * width + x) * 4;
      
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      
      // Apply kernel to neighborhood
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const kernelIndex = (ky + 2) * 5 + (kx + 2);
          const dataIndex = ((y + ky) * width + (x + kx)) * 4;
          
          sumR += data[dataIndex] * normalizedKernel[kernelIndex];
          sumG += data[dataIndex + 1] * normalizedKernel[kernelIndex];
          sumB += data[dataIndex + 2] * normalizedKernel[kernelIndex];
        }
      }
      
      // Set the blurred pixel
      resultData[pixelIndex] = Math.round(sumR);
      resultData[pixelIndex + 1] = Math.round(sumG);
      resultData[pixelIndex + 2] = Math.round(sumB);
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Performs color-based image segmentation
 * Identifies regions of similar color and applies distinct colors to each segment
 * 
 * @param {ImageData} imageData - The image data to process
 * @param {number} tolerance - Color similarity tolerance (1-50)
 * @param {number} minSize - Minimum segment size in pixels
 * @param {string} colorScheme - Coloring method to use for segments
 * @returns {ImageData} The processed image data with colored segments
 */
export const applySegmentation = (imageData, tolerance, minSize = 100, colorScheme) => {
  const width = imageData.width;
  const height = imageData.height;
  const data = new Uint8ClampedArray(imageData.data);
  const resultData = new Uint8ClampedArray(data);
  
  // Create a map to track which segment each pixel belongs to
  const segmentMap = new Array(width * height).fill(-1);
  
  // A map to track segment size
  const segmentSizes = {};
  
  // A map to track segment average color
  const segmentColors = {};
  
  // Stack for flood fill algorithm
  const stack = [];
  
  // Current segment ID
  let currentSegment = 0;
  
  // Flood fill function
  const floodFill = (x, y, baseR, baseG, baseB) => {
    stack.push([x, y]);
    segmentMap[y * width + x] = currentSegment;
    
    // Initialize segment color and size tracking
    segmentSizes[currentSegment] = 1;
    segmentColors[currentSegment] = {
      r: baseR,
      g: baseG,
      b: baseB,
      count: 1
    };
    
    while (stack.length > 0) {
      const pos = stack.pop();
      const cx = pos[0];
      const cy = pos[1];
      const pixelIndex = (cy * width + cx) * 4;
      
      // Check neighboring pixels (4-connected)
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
      ];
      
      for (let i = 0; i < directions.length; i++) {
        const nx = cx + directions[i][0];
        const ny = cy + directions[i][1];
        
        // Skip if out of bounds
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
          continue;
        }
        
        // Skip if already assigned to a segment
        const neighborIndex = ny * width + nx;
        if (segmentMap[neighborIndex] !== -1) {
          continue;
        }
        
        // Get neighbor color
        const nIndex = neighborIndex * 4;
        const nr = data[nIndex];
        const ng = data[nIndex + 1];
        const nb = data[nIndex + 2];
        
        // Calculate color difference
        const colorDiff = Math.sqrt(
          Math.pow(baseR - nr, 2) +
          Math.pow(baseG - ng, 2) +
          Math.pow(baseB - nb, 2)
        );
        
        // If color is similar enough, add to segment
        if (colorDiff <= tolerance) {
          stack.push([nx, ny]);
          segmentMap[neighborIndex] = currentSegment;
          segmentSizes[currentSegment]++;
          
          // Update average color
          segmentColors[currentSegment].r += nr;
          segmentColors[currentSegment].g += ng;
          segmentColors[currentSegment].b += nb;
          segmentColors[currentSegment].count++;
        }
      }
    }
    
    // Calculate average color for segment
    const segColor = segmentColors[currentSegment];
    segColor.r = Math.round(segColor.r / segColor.count);
    segColor.g = Math.round(segColor.g / segColor.count);
    segColor.b = Math.round(segColor.b / segColor.count);
    
    // Move to next segment
    currentSegment++;
  };
  
  // Process all pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      
      // Skip if already assigned to a segment
      if (segmentMap[index] !== -1) {
        continue;
      }
      
      // Get pixel color
      const pixelIndex = index * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      
      // Start a new segment
      floodFill(x, y, r, g, b);
    }
  }
  
  // Merge small segments with neighbors
  const mergeMap = {};
  for (let i = 0; i < currentSegment; i++) {
    mergeMap[i] = i; // Initially, each segment points to itself
  }
  
  // Find small segments and merge them
  for (let i = 0; i < currentSegment; i++) {
    if (segmentSizes[i] < minSize) {
      // Find neighbors of this segment
      const neighbors = new Set();
      
      // Look for neighbors in the segment map
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          
          if (segmentMap[index] === i) {
            // Check neighboring pixels
            const directions = [
              [-1, 0], [1, 0], [0, -1], [0, 1]
            ];
            
            for (let j = 0; j < directions.length; j++) {
              const nx = x + directions[j][0];
              const ny = y + directions[j][1];
              
              // Skip if out of bounds
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                continue;
              }
              
              const neighborSegment = segmentMap[ny * width + nx];
              if (neighborSegment !== i && neighborSegment !== -1) {
                neighbors.add(mergeMap[neighborSegment]);
              }
            }
          }
        }
      }
      
      // Find closest neighbor by color
      let bestNeighbor = -1;
      let minColorDiff = Infinity;
      
      const neighborArray = Array.from(neighbors);
      for (let j = 0; j < neighborArray.length; j++) {
        const neighborSegment = neighborArray[j];
        const colorDiff = Math.sqrt(
          Math.pow(segmentColors[i].r - segmentColors[neighborSegment].r, 2) +
          Math.pow(segmentColors[i].g - segmentColors[neighborSegment].g, 2) +
          Math.pow(segmentColors[i].b - segmentColors[neighborSegment].b, 2)
        );
        
        if (colorDiff < minColorDiff) {
          minColorDiff = colorDiff;
          bestNeighbor = neighborSegment;
        }
      }
      
      // Merge with best neighbor if found
      if (bestNeighbor !== -1) {
        mergeMap[i] = bestNeighbor;
      }
    }
  }
  
  // Apply merge mapping (flatten merge chains)
  for (let i = 0; i < currentSegment; i++) {
    let target = i;
    while (mergeMap[target] !== target) {
      target = mergeMap[target];
    }
    mergeMap[i] = target;
  }
  
  // Collect unique segments after merging
  const uniqueSegments = new Set();
  for (let i = 0; i < currentSegment; i++) {
    uniqueSegments.add(mergeMap[i]);
  }
  const segmentList = Array.from(uniqueSegments);
  
  // Generate distinct colors for each segment
  const colors = assignColorsToSegments(segmentList, segmentColors, colorScheme);
  
  // Apply colors to the result image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const pixelSegment = segmentMap[index];
      
      if (pixelSegment !== -1) {
        const mergedSegment = mergeMap[pixelSegment];
        const color = colors[mergedSegment];
        
        if (color) {
          const pixelIndex = index * 4;
          resultData[pixelIndex] = color.r;
          resultData[pixelIndex + 1] = color.g;
          resultData[pixelIndex + 2] = color.b;
        }
      }
    }
  }
  
  return new ImageData(resultData, width, height);
};

/**
 * Assigns colors to segments based on the specified color scheme
 * 
 * @param {Array} segmentList - List of segment IDs
 * @param {Object} segmentColors - Map of segment colors
 * @param {string} colorScheme - Color scheme to use
 * @returns {Object} Map of segment IDs to color objects
 */
const assignColorsToSegments = (segmentList, segmentColors, colorScheme) => {
  const colors = {};
  
  switch (colorScheme) {
    case 'rainbow':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i / segmentList.length) * 360;
        const rgb = hsvToRgb(hue, 0.8, 0.9);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    case 'pastel':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i / segmentList.length) * 360;
        const rgb = hsvToRgb(hue, 0.4, 0.95);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    case 'grayscale':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const value = 255 - Math.round((i / segmentList.length) * 220);
        colors[segment] = { r: value, g: value, b: value };
      }
      break;
      
    case 'highContrast':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i * 137.5) % 360; // Golden angle to maximize contrast
        const rgb = hsvToRgb(hue, 1, 1);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    case 'preserveBrightness':
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const origColor = segmentColors[segment];
        // Calculate brightness
        const brightness = (origColor.r * 0.299 + origColor.g * 0.587 + origColor.b * 0.114) / 255;
        
        // Generate a random hue but preserve brightness
        const hue = Math.random() * 360;
        const rgb = hsvToRgb(hue, 0.8, brightness);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
      break;
      
    default:
      // Default to rainbow
      for (let i = 0; i < segmentList.length; i++) {
        const segment = segmentList[i];
        const hue = (i / segmentList.length) * 360;
        const rgb = hsvToRgb(hue, 0.8, 0.9);
        colors[segment] = { r: rgb[0], g: rgb[1], b: rgb[2] };
      }
  }
  
  return colors;
};

/**
 * Utility function to clamp a value between 0 and 255
 * 
 * @param {number} value - The value to clamp
 * @returns {number} The clamped value
 */
const clamp = (value) => {
  return Math.min(255, Math.max(0, value));
};