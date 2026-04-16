import * as THREE from 'three';

export interface LidarPoint {
  x: number;
  y: number;
  z: number;
  intensity: number;
  classification?: number;
}

export const generateMockLidarData = (pointsCount: number = 10000): LidarPoint[] => {
  const points: LidarPoint[] = [];
  const size = 50;
  
  for (let i = 0; i < pointsCount; i++) {
    const x = (Math.random() - 0.5) * size;
    const z = (Math.random() - 0.5) * size;
    
    // Create a terrain-like surface
    const y = Math.sin(x * 0.2) * Math.cos(z * 0.2) * 5 + 
              Math.sin(x * 0.05) * 2 + 
              (Math.random() - 0.5) * 0.5;
    
    // Add some "buildings"
    let finalY = y;
    let classification = 2; // Ground
    
    if (Math.abs(x - 10) < 5 && Math.abs(z - 10) < 5) {
      finalY += 10 + Math.random();
      classification = 6; // Building
    }
    
    if (Math.abs(x + 15) < 3 && Math.abs(z + 5) < 3) {
      finalY += 8 + Math.random();
      classification = 6;
    }

    // Add some "trees"
    if (Math.random() > 0.98) {
      const treeHeight = 5 + Math.random() * 5;
      for (let j = 0; j < 5; j++) {
        points.push({
          x: x + (Math.random() - 0.5),
          y: y + treeHeight * (j / 5),
          z: z + (Math.random() - 0.5),
          intensity: Math.random(),
          classification: 3 // Vegetation
        });
      }
    }

    points.push({
      x,
      y: finalY,
      z,
      intensity: Math.random(),
      classification
    });
  }
  
  return points;
};

export const CLASSIFICATION_COLORS: Record<number, number> = {
  0: 0x888888, // Unclassified
  1: 0xaaaaaa, // Default
  2: 0x8b4513, // Ground (Brown)
  3: 0x228b22, // Low Vegetation (Green)
  4: 0x006400, // Medium Vegetation
  5: 0x004d00, // High Vegetation
  6: 0xff4500, // Building (Orange-Red)
  7: 0xff0000, // Noise
  9: 0x0000ff, // Water
};
