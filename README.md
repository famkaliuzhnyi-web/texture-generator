# AI Texture Generator

A full-stack web application that generates unique textures using AI. The application consists of a Node.js/Express backend integrated with Ollama for AI-powered texture analysis and a React frontend for user interaction.

## Features

- 🎨 **AI-Powered Generation**: Uses Ollama (with llama3.2 by default) to analyze texture prompts
- 🖼️ **Multiple Variations**: Generates 4 unique texture samples per request
- 📏 **Customizable Size**: Support for various texture sizes (16x16 to 512x512)
- 💾 **Easy Download**: One-click download of generated textures
- 🎯 **Smart Fallback**: Works even without Ollama using built-in pattern generation
- 🌐 **Web Interface**: Clean, responsive React UI
- 🔄 **Real-time Status**: Shows Ollama connection status and available models

## Architecture

```
Frontend (React)     Backend (Node.js/Express)     AI (Ollama)
     |                        |                        |
     |----> API Requests ---->|                        |
     |                        |----> LLM Queries ---->|
     |<---- Texture URLs <----|<---- AI Analysis <----|
     |                        |                        |
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Ollama (optional, but recommended for AI features)

## Quick Start

### 1. Install Ollama (Recommended)

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

Pull the required model:
```bash
ollama pull llama3.2
```

### 2. Setup the Project

Clone and install dependencies:
```bash
git clone <repository-url>
cd texture-generator

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 3. Run the Application

#### Option A: Manual Start

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend:**
```bash
cd frontend
npm start
```

#### Option B: Docker (Full Stack)

```bash
docker-compose up -d
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## Usage

1. **Enter a Texture Description**: Describe the texture you want (e.g., "rough stone wall", "wooden planks", "rusty metal")

2. **Select Size**: Choose from 16x16 to 512x512 pixels

3. **Set Filename**: Choose a base filename for your textures

4. **Generate**: Click "Generate 4 Textures" to create variations

5. **Download**: Click on any generated texture to download it

## API Endpoints

### POST `/api/generate-textures`
Generate texture variations based on a prompt.

**Request Body:**
```json
{
  "prompt": "rough stone wall",
  "size": 64,
  "filename": "stone_texture"
}
```

**Response:**
```json
{
  "success": true,
  "textures": [
    {
      "id": 1,
      "filename": "stone_texture_1_1635789123456.png",
      "url": "/texture-generator/backend/public/stone_texture_1_1635789123456.png",
      "downloadUrl": "/api/download/stone_texture_1_1635789123456.png"
    }
  ],
  "prompt": "rough stone wall",
  "size": 64,
  "generated_at": "2023-11-01T12:00:00.000Z"
}
```

### GET `/api/download/:filename`
Download a specific texture file.

### GET `/api/ollama-status`
Check Ollama connection status and available models.

### GET `/health`
Health check endpoint.

## Configuration

### Backend Environment Variables

Create `backend/.env`:
```env
PORT=3001
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Texture Generation

The system supports multiple texture types and patterns:

- **Types**: stone, wood, metal, fabric, abstract, nature
- **Patterns**: random, grid, organic, geometric, noise
- **Parameters**: colors, roughness, contrast

## Development

### Project Structure

```
texture-generator/
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   ├── .env              # Environment configuration
│   └── public/           # Generated texture storage
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Styles
│   └── package.json      # Frontend dependencies
├── docker-compose.yml    # Full stack Docker setup
└── README.md            # This file
```

### Adding New Texture Types

1. Extend the `getDefaultTextureParams()` method in `backend/server.js`
2. Add new pattern generation methods in the `TextureGenerator` class
3. Update the prompt analysis logic for better AI integration

### Customizing the UI

The frontend uses vanilla CSS with a modern design. Key files:
- `src/App.js` - Main component logic
- `src/index.css` - All styles and responsive design

## Deployment

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

### Docker Deployment

```bash
docker-compose up -d --build
```

This will start:
- Ollama service on port 11434
- Backend API on port 3001  
- Frontend on port 3000

## Troubleshooting

### Ollama Connection Issues

1. Ensure Ollama is running: `ollama list`
2. Check the model is available: `ollama pull llama3.2`
3. Verify the URL in backend/.env

### Texture Generation Fails

1. Check backend logs for errors
2. Verify canvas/sharp dependencies are installed
3. Ensure sufficient disk space for texture storage

### Frontend Build Issues

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check Node.js version compatibility (18+)
3. Verify proxy configuration in package.json

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Support for more AI models (GPT-4, Claude, etc.)
- [ ] Texture editing and modification tools
- [ ] Batch generation capabilities
- [ ] 3D texture preview
- [ ] Texture animation generation
- [ ] Custom pattern templates
- [ ] User accounts and texture galleries
