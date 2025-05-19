# Call-In Show Host Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/yourusername/call-in-show-dashboard/releases/tag/v0.1.0)

A professional dashboard for managing live call-in shows with video streaming capabilities, built with React, TypeScript, and the Datagram SDK.

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Authentication**
  - Secure login system
  - Protected routes
  - Session management
  
- **Live Show Management**
  - Start/end shows with custom names
  - Real-time show status tracking
  - Clean, intuitive interface

- **Caller Management** (Coming in v0.2)
  - Queue system for incoming callers
  - Caller information tracking
  - One-click promotion to live

- **Video Streaming** (Coming in v0.3)
  - Powered by Datagram SDK
  - Multiple participant support
  - Media controls (mute, camera, etc.)

## Features

- **Live Show Management**
  - Start/end shows with custom names
  - Real-time show status tracking
  - Clean, intuitive interface

- **Caller Management**
  - Queue system for incoming callers
  - Caller information tracking
  - One-click promotion to live

- **Video Streaming**
  - Powered by Datagram SDK
  - Multiple participant support
  - Media controls (mute, camera, etc.)

- **Authentication**
  - Secure login system
  - Protected routes
  - Session management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/call-in-show-dashboard.git
   cd call-in-show-dashboard
   git checkout v0.1.0  # Checkout the latest stable version
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   REACT_APP_API_URL=your_api_url_here
   REACT_APP_DATAGRAM_API_KEY=your_api_key_here
   ```
   ```env
   REACT_APP_DATAGRAM_API_KEY=your_api_key_here
   REACT_APP_DATAGRAM_ORIGIN=https://your-origin-here.com
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open in your browser**
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Demo Credentials

- **Email**: host@example.com
- **Password**: password

## Project Structure

```
src/
├── assets/           # Static assets (images, fonts, etc.)
├── components/       # Reusable UI components
├── contexts/         # React context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── ShowContext.tsx  # Show and caller state
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── Login.tsx     # Login page
│   └── HostDashboard.tsx  # Main dashboard
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Datagram SDK Integration

The application integrates with the Datagram SDK for real-time video streaming. Key integration points include:

1. **Initialization**
   ```typescript
   import { Client, Conference } from '@datagram-network/conference-sdk';
   
   const client = Client.create({
     alias: 'your-show-id',
     origin: process.env.REACT_APP_DATAGRAM_ORIGIN,
   });
   
   const conference = new Conference(client, {
     skipMediaSettings: true,
     turnOnCam: true,
     turnOnMic: true,
   });
   ```

2. **Event Handling**
   ```typescript
   window.addEventListener('message', (event) => {
     switch (event.data) {
       case 'call_ended':
         // Handle call end
         break;
       case 'call-ready':
         // Call is ready
         break;
       // Other events...
     }
   });
   ```

## 🛠 Development

### Available Scripts

In the project directory, you can run:

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - email@example.com

Project Link: [https://github.com/yourusername/call-in-show-dashboard](https://github.com/yourusername/call-in-show-dashboard)

## Acknowledgments

- [Datagram SDK](https://sdk.datagram.network/) for video streaming
- [Mantine](https://mantine.dev/) for UI components
- [React](https://reactjs.org/) for the frontend framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
