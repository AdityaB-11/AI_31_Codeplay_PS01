# AI Avatar Assistant with Knowledge Base Integration

A versatile AI-powered avatar assistant that provides interactive, conversational support using a combination of knowledge base responses and AI-generated fallbacks. This demonstration uses the Nimbus ERP dataset to showcase the system's capabilities in handling domain-specific queries.

## 🎯 Features

- **Intelligent Chat Interface**: Dynamic conversation handling with role-based responses
- **Knowledge Base Integration**: 
  - Pre-configured responses for common queries
  - Domain-specific information retrieval
  - Confidence scoring for response accuracy
- **AI-Powered Fallback**: 
  - Gemini AI integration for handling complex queries
  - Natural language understanding and generation
  - Context-aware responses
- **Role-Based Support**:
  - Business Support Specialist
  - Technical Support Engineer
  - Customer Support Representative
- **Modern UI/UX**: 
  - Responsive design with Tailwind CSS
  - Role-based avatar visualization
  - Professional styling and animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Generative AI (Gemini)
- **State Management**: React Context
- **API Routes**: Next.js API Routes
- **Image Optimization**: Next.js Image Component

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with required environment variables:
```
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

## 💡 How It Works

1. **Knowledge Base Processing**:
   - Queries are first matched against the knowledge base
   - Responses include confidence scores
   - High-confidence matches are returned immediately

2. **AI Fallback System**:
   - Queries without knowledge base matches are processed by Gemini AI
   - Context-aware responses are generated
   - Role-specific formatting is applied

3. **Response Flow**:
   ```
   User Query → Knowledge Base Check → [If found] → Return KB Response
                                   → [If not found] → Generate AI Response
                                   → Format Based on Role
   ```

## 🎯 Demo Dataset: Nimbus ERP

The system is demonstrated using the Nimbus ERP dataset, which includes:

### Nimbus Core
- Comprehensive ERP solution
- Features: Accounting, Inventory, HR & Payroll, CRM
- Pricing: Basic ($49/user/month), Pro ($99/user/month), Enterprise (Custom)

### Nimbus Finance
- Financial management solution
- Features: Budgeting, Forecasting, Tax Compliance
- Pricing: Basic ($29/user/month), Pro ($59/user/month), Enterprise (Custom)

## 🔧 Customization

The system can be adapted for different domains by:
1. Updating the knowledge base with domain-specific content
2. Modifying role configurations
3. Adjusting AI prompts for specific use cases
4. Customizing avatar representations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and queries:
- Documentation: [docs-url]
- Community Forum: [forum-url]
- Email: support@example.com

## 🔮 Future Enhancements

- Multi-language support
- Voice interaction capabilities
- Enhanced avatar animations
- Real-time knowledge base updates
- Advanced analytics and insights
- Emotion detection and response
- Integration with external APIs
