require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create public directory for generated textures
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Texture generation utility
class TextureGenerator {
  constructor() {
    // Initialize with Jimp
  }

  // Generate procedural texture based on prompt
  async generateTexture(prompt, width = 32, height = 32) {
    try {
      // Use Ollama to analyze the prompt and generate texture parameters
      const textureParams = await this.analyzePromptWithOllama(prompt);
      
      // Create image with Jimp
      const image = new Jimp(width, height, 0x00000000);
      
      // Generate texture based on analyzed parameters
      this.drawTexture(image, textureParams, width, height);
      
      return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
      console.error('Error generating texture:', error);
      return await this.generateFallbackTexture(width, height);
    }
  }

  async analyzePromptWithOllama(prompt) {
    try {
      console.log(`Connecting to Ollama at ${OLLAMA_URL}`);
      
      // First check if Ollama is available
      const healthResponse = await axios.get(`${OLLAMA_URL}/api/tags`, {
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!healthResponse.data || !healthResponse.data.models) {
        throw new Error('Ollama is running but no models available');
      }

      console.log('Ollama is available, making generation request...');
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3.2',
        prompt: `Analyze this texture description and provide texture generation parameters in JSON format. 
        Description: "${prompt}"
        
        Respond with JSON containing:
        - colors: array of hex colors (3-5 colors)
        - pattern: "random", "grid", "organic", "geometric", "noise"
        - roughness: number 0-1 (0=smooth, 1=rough)
        - contrast: number 0-1
        - type: "stone", "wood", "metal", "fabric", "abstract", "nature"
        
        Example: {"colors":["#8B4513","#D2691E","#F4A460"],"pattern":"organic","roughness":0.7,"contrast":0.6,"type":"wood"}`,
        stream: false
      }, {
        timeout: 30000, // 30 second timeout for generation
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Ollama response received');
      
      if (response.data && response.data.response) {
        try {
          const jsonMatch = response.data.response.match(/\{.*\}/);
          if (jsonMatch) {
            console.log('Successfully parsed Ollama response');
            return JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.log('Error parsing Ollama response, using defaults:', parseError.message);
        }
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('Ollama connection refused - Ollama is not running on port 11434');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('Ollama request timed out');
      } else if (error.response && error.response.status === 404) {
        console.log('Ollama API endpoint not found - check if llama3.2 model is installed');
        console.log('Run: ollama pull llama3.2');
      } else {
        console.log('Ollama error:', error.message);
      }
    }

    // Default parameters if Ollama is not available
    console.log('Using default texture parameters');
    return this.getDefaultTextureParams(prompt);
  }

  getDefaultTextureParams(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('wood') || lowerPrompt.includes('bark')) {
      return {
        colors: ['#8B4513', '#D2691E', '#F4A460', '#654321'],
        pattern: 'organic',
        roughness: 0.7,
        contrast: 0.6,
        type: 'wood'
      };
    } else if (lowerPrompt.includes('stone') || lowerPrompt.includes('rock') || lowerPrompt.includes('wall')) {
      return {
        colors: ['#696969', '#A9A9A9', '#808080', '#D3D3D3'],
        pattern: 'noise',
        roughness: 0.8,
        contrast: 0.7,
        type: 'stone'
      };
    } else if (lowerPrompt.includes('metal') || lowerPrompt.includes('steel')) {
      return {
        colors: ['#C0C0C0', '#808080', '#A9A9A9', '#DCDCDC'],
        pattern: 'grid',
        roughness: 0.3,
        contrast: 0.8,
        type: 'metal'
      };
    } else if (lowerPrompt.includes('grass') || lowerPrompt.includes('leaf')) {
      return {
        colors: ['#228B22', '#32CD32', '#90EE90', '#006400'],
        pattern: 'organic',
        roughness: 0.6,
        contrast: 0.5,
        type: 'nature'
      };
    } else {
      return {
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        pattern: 'random',
        roughness: 0.5,
        contrast: 0.6,
        type: 'abstract'
      };
    }
  }

  drawTexture(image, params, width, height) {
    const { colors, pattern, roughness, contrast } = params;
    
    // Fill base color
    const baseColor = this.hexToInt(colors[0]);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        image.setPixelColor(baseColor, x, y);
      }
    }

    switch (pattern) {
      case 'noise':
        this.drawNoisePattern(image, colors, width, height, roughness);
        break;
      case 'grid':
        this.drawGridPattern(image, colors, width, height);
        break;
      case 'organic':
        this.drawOrganicPattern(image, colors, width, height, roughness);
        break;
      case 'geometric':
        this.drawGeometricPattern(image, colors, width, height);
        break;
      default:
        this.drawRandomPattern(image, colors, width, height, roughness);
    }

    // Apply contrast adjustment
    if (contrast !== 0.5) {
      this.adjustContrast(image, width, height, contrast);
    }
  }

  drawNoisePattern(image, colors, width, height, roughness) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (Math.random() < roughness) {
          const colorIndex = Math.floor(Math.random() * colors.length);
          const color = this.hexToInt(colors[colorIndex]);
          
          // Add some noise variation
          const rgb = Jimp.intToRGBA(color);
          const noise = (Math.random() - 0.5) * 50;
          
          rgb.r = Math.max(0, Math.min(255, rgb.r + noise));
          rgb.g = Math.max(0, Math.min(255, rgb.g + noise));
          rgb.b = Math.max(0, Math.min(255, rgb.b + noise));
          
          const noisyColor = Jimp.rgbaToInt(rgb.r, rgb.g, rgb.b, rgb.a);
          image.setPixelColor(noisyColor, x, y);
        }
      }
    }
  }

  drawGridPattern(image, colors, width, height) {
    const gridSize = Math.max(2, Math.floor(Math.min(width, height) / 8));
    
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        const colorIndex = ((Math.floor(x / gridSize)) + (Math.floor(y / gridSize))) % colors.length;
        const color = this.hexToInt(colors[colorIndex]);
        
        for (let dx = 0; dx < gridSize && x + dx < width; dx++) {
          for (let dy = 0; dy < gridSize && y + dy < height; dy++) {
            image.setPixelColor(color, x + dx, y + dy);
          }
        }
      }
    }
  }

  drawOrganicPattern(image, colors, width, height, roughness) {
    // Create organic blob patterns using circles
    const numBlobs = Math.floor(colors.length * 3);
    
    for (let i = 0; i < numBlobs; i++) {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const radius = (Math.random() * Math.min(width, height) / 4) + (Math.min(width, height) / 8);
      const color = this.hexToInt(colors[Math.floor(Math.random() * colors.length)]);
      
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (distance < radius) {
            const alpha = Math.max(0, 1 - (distance / radius));
            if (Math.random() < alpha * roughness) {
              image.setPixelColor(color, x, y);
            }
          }
        }
      }
    }
  }

  drawGeometricPattern(image, colors, width, height) {
    const shapes = Math.floor(Math.min(width, height) / 4);
    
    for (let i = 0; i < shapes; i++) {
      const color = this.hexToInt(colors[i % colors.length]);
      
      if (Math.random() > 0.5) {
        // Rectangle
        const x = Math.floor(Math.random() * width * 0.7);
        const y = Math.floor(Math.random() * height * 0.7);
        const w = Math.floor(Math.random() * width * 0.3 + width * 0.1);
        const h = Math.floor(Math.random() * height * 0.3 + height * 0.1);
        
        for (let dx = 0; dx < w && x + dx < width; dx++) {
          for (let dy = 0; dy < h && y + dy < height; dy++) {
            image.setPixelColor(color, x + dx, y + dy);
          }
        }
      } else {
        // Circle
        const centerX = Math.random() * width;
        const centerY = Math.random() * height;
        const radius = Math.random() * Math.min(width, height) * 0.2 + Math.min(width, height) * 0.05;
        
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance < radius) {
              image.setPixelColor(color, x, y);
            }
          }
        }
      }
    }
  }

  drawRandomPattern(image, colors, width, height, roughness) {
    // Random pixel-like pattern
    const numPixels = Math.floor(width * height * roughness);
    
    for (let i = 0; i < numPixels; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const color = this.hexToInt(colors[Math.floor(Math.random() * colors.length)]);
      
      image.setPixelColor(color, x, y);
    }
  }

  adjustContrast(image, width, height, contrast) {
    const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
    
    image.scan(0, 0, width, height, function (x, y, idx) {
      this.bitmap.data[idx] = Math.min(255, Math.max(0, factor * (this.bitmap.data[idx] - 128) + 128));
      this.bitmap.data[idx + 1] = Math.min(255, Math.max(0, factor * (this.bitmap.data[idx + 1] - 128) + 128));
      this.bitmap.data[idx + 2] = Math.min(255, Math.max(0, factor * (this.bitmap.data[idx + 2] - 128) + 128));
    });
  }

  hexToInt(hex) {
    // Remove # if present and convert to RGB
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substr(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substr(2, 2), 16) || 0;
    const b = parseInt(cleanHex.substr(4, 2), 16) || 0;
    
    // Use JIMP's built-in method for color conversion
    return Jimp.rgbaToInt(r, g, b, 255);
  }

  async generateFallbackTexture(width, height) {
    const image = new Jimp(width, height, 0x000000FF);
    
    // Simple checkerboard pattern as fallback
    const tileSize = Math.max(1, Math.floor(Math.min(width, height) / 8));
    for (let x = 0; x < width; x += tileSize) {
      for (let y = 0; y < height; y += tileSize) {
        const color = ((Math.floor(x / tileSize)) + (Math.floor(y / tileSize))) % 2 ? 0x333333FF : 0x666666FF;
        
        for (let dx = 0; dx < tileSize && x + dx < width; dx++) {
          for (let dy = 0; dy < tileSize && y + dy < height; dy++) {
            image.setPixelColor(color, x + dx, y + dy);
          }
        }
      }
    }
    
    return await image.getBufferAsync(Jimp.MIME_PNG);
  }
}

// Initialize texture generator
const textureGenerator = new TextureGenerator();

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate-textures', async (req, res) => {
  try {
    const { prompt, width = 32, height = 32 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const textureWidth = parseInt(width) || 32;
    const textureHeight = parseInt(height) || 32;

    console.log(`Generating textures for prompt: "${prompt}", size: ${textureWidth}x${textureHeight}`);

    // Generate 4 texture variations
    const textures = [];
    for (let i = 0; i < 4; i++) {
      const textureBuffer = await textureGenerator.generateTexture(prompt, textureWidth, textureHeight);
      
      // Save texture to public directory
      const textureFilename = `texture_${i + 1}_${Date.now()}.png`;
      const texturePath = path.join(publicDir, textureFilename);
      
      fs.writeFileSync(texturePath, textureBuffer);
      
      textures.push({
        id: i + 1,
        filename: textureFilename,
        url: `/texture-generator/backend/public/${textureFilename}`,
        downloadUrl: `/api/download/${textureFilename}`
      });
    }

    res.json({
      success: true,
      textures,
      prompt,
      width: textureWidth,
      height: textureHeight,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating textures:', error);
    res.status(500).json({ 
      error: 'Failed to generate textures',
      details: error.message 
    });
  }
});

app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(publicDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Test Ollama connection
app.get('/api/ollama-status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000
    });
    res.json({ 
      status: 'connected', 
      models: response.data.models || [],
      url: OLLAMA_URL 
    });
  } catch (error) {
    let status = 'disconnected';
    let note = 'Ollama is not running or not accessible';
    
    if (error.code === 'ECONNREFUSED') {
      note = 'Ollama is not running. Start it with: ollama serve';
    } else if (error.response && error.response.status === 404) {
      note = 'Ollama is running but API endpoint not found';
    }
    
    res.json({ 
      status,
      error: error.message,
      url: OLLAMA_URL,
      note
    });
  }
});

// Clean up old textures (older than 1 hour)
const cleanupInterval = setInterval(() => {
  try {
    const files = fs.readdirSync(publicDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old texture: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// Graceful shutdown
process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
  console.log('\nShutting down texture generator server...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Texture Generator Backend running on port ${PORT}`);
  console.log(`Ollama URL: ${OLLAMA_URL}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Check Ollama status on startup
  axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 })
    .then(() => {
      console.log('✅ Ollama is connected and ready');
    })
    .catch(() => {
      console.log('⚠️  Ollama not available - using fallback texture generation');
      console.log('   To enable AI features, install and start Ollama:');
      console.log('   1. Download from https://ollama.ai');
      console.log('   2. Run: ollama pull llama3.2');
      console.log('   3. Ollama should start automatically');
    });
});
