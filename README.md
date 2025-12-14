# Hello WebXR - AR Cube Demo

A simple WebXR augmented reality application that displays a colorful 3D cube in AR, based on Google's Hello WebXR tutorial.

## Features

- 🎨 Colorful 3D cube with different colors on each side
- 📱 Mobile AR support via WebXR
- 🌐 Three.js for 3D rendering
- 🔒 HTTPS development server

## Prerequisites

- A WebXR-compatible device (Android phone with ARCore support)
- Chrome or Edge browser with WebXR support
- Node.js and npm installed

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate SSL certificates for HTTPS (required for WebXR):
```bash
# Install mkcert (if not already installed)
# On Ubuntu/Debian:
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert

# Create local CA
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1
```

This will create `localhost.pem` and `localhost-key.pem` files.

3. Start the development server:
```bash
npm run dev
```

4. Open the displayed local network URL on your mobile device (e.g., `https://192.168.x.x:5175`)

## Usage

1. Tap the "Start Hello WebXR" button
2. Grant camera permissions when prompted
3. Move your device to see the colorful cube in AR
4. The cube will appear 1 meter in front of you and 1 meter up

## Technology Stack

- **WebXR Device API**: For AR functionality
- **Three.js**: 3D rendering library
- **Vite**: Development server with HTTPS support

## Project Structure

```
.
├── index.html          # Main HTML file with WebXR implementation
├── style.css           # Styling for the UI
├── package.json        # Project dependencies
├── vite.config.js      # Vite configuration with HTTPS
└── README.md           # This file
```

## How It Works

1. **User Interaction**: WebXR requires a user gesture to start a session
2. **Scene Setup**: Creates a Three.js scene with a colored cube
3. **XR Session**: Initializes an immersive AR session
4. **Render Loop**: Continuously updates the camera and renders the scene
5. **AR View**: Displays the 3D cube overlaid on the real world

## Browser Support

- Chrome for Android (with ARCore)
- Samsung Internet
- Edge for Android

## Troubleshooting

- **"WebXR not supported"**: Ensure you're using HTTPS and a compatible browser
- **Camera not working**: Grant camera permissions in browser settings
- **Certificate warnings**: Accept the self-signed certificate for localhost

## License

MIT
