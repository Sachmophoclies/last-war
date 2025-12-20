# Last War Helper

A comprehensive web application for Last War players featuring optimization tools and curated community guides.

## Features

### Satch's Utilities

#### Arms Race - Unit Progression Calculator
An advanced calculator designed to help you maximize your Arms Race Unit Progression rewards while minimizing speedup usage.

**Key Features:**
- Auto-calculates next Unit Progression time based on the official schedule
- Converts EST event times to your local timezone automatically
- Optimizes training strategy across parallel barracks
- Provides detailed step-by-step instructions
- Calculates exact speedup requirements
- Configurable unit levels (1-10) with automatic point lookup
- Persistent settings via cookies

**How to Use:**
1. Enter your barracks configuration (number of barracks, capacity)
2. Select your unit training level
3. Confirm or adjust the auto-calculated event time
4. Click "Calculate" to get your optimized training plan

### External Guides (Beta)

A curated collection of community-created guides covering various aspects of Last War gameplay. Access these guides by enabling Beta mode in the settings menu.

**Available Guides:**

**Skills**
- Tank Heroes - Comprehensive skill guide by Aethernis
- Air Heroes - Skill optimization by Aethernis

**Equipment**
- Equipment Leveling Guide by MONO

**Store**
- Store Purchase Guide by Aethernis

**Buildings**
- HQ 1-30 - Building progression by Aethernis
- HQ 25-30 - Advanced building optimization by Aethernis

**Research**
- Coming soon

### Additional Pages

- **About Me** - Information about the developer
- **Shoutouts** - Community recognition and support links

## Technology Stack

- **React 19.2.0** - Modern UI framework
- **React Router DOM 7.10.1** - Client-side routing
- **Vite 7.2.4** - Fast build tool and dev server
- **GitHub Pages** - Static site hosting

## Getting Started

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/last-war.git
cd last-war
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploying to GitHub Pages

```bash
npm run deploy
```

This will build the project and deploy it to GitHub Pages.

## Project Structure

```
last-war/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── HamburgerMenu.jsx
│   │   ├── CookieConsent.jsx
│   │   ├── GuideImage.jsx
│   │   ├── InfoIcon.jsx
│   │   └── Results.jsx
│   ├── pages/              # Page components
│   │   ├── ArmsRace/
│   │   │   └── UnitProgression/
│   │   ├── Guides/
│   │   │   ├── Skills/
│   │   │   ├── Buildings/
│   │   │   ├── Equipment.jsx
│   │   │   ├── Store.jsx
│   │   │   └── Research.jsx
│   │   ├── AboutMe.jsx
│   │   └── Shoutouts.jsx
│   ├── data/               # JSON configuration files
│   │   └── guides.json
│   ├── App.jsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── package.json
├── vite.config.js
└── README.md
```

## Features in Detail

### Theme System
- Dark mode (default)
- Light mode
- Theme preference persisted in localStorage

### Beta Features
- Enable Beta mode to access external community guides
- Beta state persisted in cookies
- Easily toggle on/off from the settings menu

### Cookie Consent
- GDPR-compliant cookie consent banner
- Preference persisted for 365 days
- Only essential cookies used for app functionality

### Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Expandable/collapsible menu sections
- Touch-friendly interface

### Accessibility
- Keyboard navigation support
- Focus management
- ARIA labels and attributes
- Semantic HTML structure

## Configuration

### Unit Progression Schedule

The Unit Progression event times are configured in `src/pages/ArmsRace/UnitProgression/UnitProgression.jsx`. The schedule is in EST:

- Monday: 09:00
- Tuesday: 05:00
- Wednesday: 01:00
- Thursday: 05:00
- Friday: 01:00, 21:00
- Saturday: 17:00

### Guides Configuration

External guides are configured in `src/data/guides.json`. To add a new guide:

1. Add the guide entry to `guides.json`
2. Create a page component in the appropriate directory
3. Add the route in `App.jsx`
4. Add the menu link in `HamburgerMenu.jsx`

Example:
```json
{
  "guide-name": {
    "title": "Guide Title",
    "imageUrl": "https://example.com/image.png",
    "author": "Author Name",
    "authorUrl": "https://ko-fi.com/author"
  }
}
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or find bugs, please open an issue or submit a pull request.

## Community

- Support guide creators on Ko-fi (links available in each guide)
- Join the Last War community discussions
- Share your feedback and suggestions

## License

This project is open source and available under the MIT License.

## Acknowledgments

Special thanks to all the guide creators who have contributed to the Last War community:
- **Aethernis** - Skills guides, Buildings guides, Store guide
- **MONO** - Equipment guide
- **DJ Nyx** - Community support

## Disclaimer

This is a fan-made tool and is not officially affiliated with or endorsed by Last War or its developers. All game content and trademarks are property of their respective owners.
