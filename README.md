# Call-In Show Host Dashboard

A professional dashboard for managing live call-in shows with video streaming capabilities, built with React, TypeScript, and the Datagram SDK.

![Dashboard Preview](public/dashboard-preview.png)

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

## Prerequisites

- Node.js 16+ (18+ recommended)
- npm or yarn
- Datagram SDK credentials

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/call-in-show-dashboard.git
   cd call-in-show-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with your Datagram SDK credentials:
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

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_DATAGRAM_API_KEY` | Your Datagram API key | Yes | - |
| `REACT_APP_DATAGRAM_ORIGIN` | Your application's origin | Yes | `http://localhost:3000` |
| `REACT_APP_API_URL` | Backend API URL | No | `http://localhost:5000` |

## Deployment

### Building for Production

```bash
npm run build
```

This will create a `build` directory with optimized production build.

### Docker

A `Dockerfile` is included for containerized deployment:

```bash
docker build -t call-in-show-dashboard .
docker run -p 3000:80 call-in-show-dashboard
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Datagram SDK](https://sdk.datagram.network/) for video streaming
- [Mantine](https://mantine.dev/) for UI components
- [React](https://reactjs.org/) for the frontend framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
