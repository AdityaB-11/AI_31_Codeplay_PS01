# IDMS AI Avatar Assistant

An AI-powered avatar assistant for IDMS Infotech that provides interactive, conversational support for their ERP system users. This application features a speaking avatar that responds to user queries using both text and voice.

## Features

- **Multi-modal Input**: Accept both text and voice queries from users
- **Knowledge Base Integration**: Retrieve domain-specific responses from a knowledge base
- **AI-Driven Fallback**: Use AI-generated responses when queries don't match the knowledge base
- **Text-to-Speech**: Convert AI-generated text responses into natural-sounding speech
- **Lip-Synced Avatar**: Display an avatar that visually represents the AI assistant
- **Multiple Avatar Styles**: Choose from different avatar personalities
- **Intuitive UI**: Provide a seamless user experience for interacting with the assistant

## Technology Stack

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS with responsive design
- **Speech Recognition**: Web Speech API 
- **Text-to-Speech**: Web Speech Synthesis API
- **UI Components**: HeadlessUI, Heroicons
- **HTTP Client**: Axios for API requests

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository
```
git clone https://github.com/AdityaB-11/idms-ai-avatar.git
cd idms-ai-avatar
```

2. Install dependencies
```
npm install
```

3. Run the development server
```
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/                # API routes
│   │   └── chat/          # Chat API endpoint
│   ├── components/        # React components
│   │   ├── AvatarDisplay.tsx  # Avatar visualization
│   │   ├── ChatInterface.tsx  # Chat UI
│   │   └── Header.tsx     # App header
│   ├── hooks/             # Custom React hooks
│   │   └── useSpeechRecognition.ts  # Speech recognition hook
│   ├── utils/             # Utility functions
│   │   └── speechUtils.ts # Speech utilities
│   ├── page.tsx           # Main page
│   └── layout.tsx         # App layout
├── public/                # Static assets
│   └── avatars/           # Avatar images
├── types.d.ts             # TypeScript declarations
└── package.json           # Project dependencies
```

## Future Enhancements

- Integration with more sophisticated avatar APIs (like D-ID or DeepBrain AI)
- Support for multiple languages 
- Integration with IDMS's actual ERP system knowledge base
- User authentication and personalization
- Analytics to track common user queries and improve responses
- Emotion detection to adapt avatar responses

## License

This project is licensed under the MIT License - see the LICENSE file for details.
