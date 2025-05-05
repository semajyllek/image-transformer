/**
 * Utility functions for color manipulation and conversion
 */

/**
 * Converts HSV (Hue, Saturation, Value) color to RGB (Red, Green, Blue)
 * 
 * @param {number} h - Hue value (0-360)
 * @param {number} s - Saturation value (0-1)
 * @param {number} v - Value/Brightness (0-1)
 * @returns {Array} RGB values as [r, g, b] with each component in range 0-255
 */
export const hsvToRgb = (h, s, v) => {
    let r, g, b;
    
    // Make sure h is within 0-360
    h = ((h % 360) + 360) % 360;
    
    // Handle special case of s=0 (grayscale)
    if (s === 0) {
      r = g = b = v;
      return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
      ];
    }
    
    const i = Math.floor(h / 60) % 6;
    const f = h / 60 - Math.floor(h / 60);
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        r = v;
        g = p;
        b = q;
        break;
    }
    
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  };