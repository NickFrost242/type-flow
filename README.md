# TypeRace - Typing Speed Test

A modern, responsive typing speed test application built with React and TypeScript that measures your Words Per Minute (WPM) and accuracy in real-time.

## Features

- **Continuous Word Stream**: Type through a never-ending stream of random English words
- **Real-time WPM Calculation**: See your typing speed update as you type
- **Accuracy Tracking**: Monitor your typing accuracy percentage
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Results Analysis**: Detailed breakdown of your performance
- **Performance Ratings**: Get feedback on your typing level
- **Mobile Responsive**: Works perfectly on all device sizes

## How to Use

1. **Start the Test**: Click "Start Typing Test" to begin
2. **Type the Words**: Type each word as it appears, pressing space after each word
3. **Monitor Progress**: Watch your WPM, accuracy, and time in real-time
4. **Complete the Test**: Press ESC or click "Complete Test" when finished
5. **Review Results**: See your detailed performance metrics
6. **Try Again**: Take another test to improve your speed

## Performance Metrics

The app tracks several key metrics:

- **WPM (Words Per Minute)**: Your typing speed
- **Accuracy**: Percentage of correctly typed words
- **Time Elapsed**: Total time spent typing
- **Words Typed**: Total number of words attempted
- **Correct Words**: Number of words typed correctly
- **Errors**: Number of mistakes made

## Performance Ratings

### WPM Ratings:
- 80+ WPM: Excellent
- 60-79 WPM: Good
- 40-59 WPM: Average
- 20-39 WPM: Below Average
- <20 WPM: Beginner

### Accuracy Ratings:
- 98%+: Excellent
- 95-97%: Good
- 90-94%: Average
- 80-89%: Below Average
- <80%: Needs Improvement

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/NickFrost242/typeflow.git
cd typeflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Deployment

#### GitHub Pages (Recommended)

1. **Update the homepage URL** in `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/typerace"
   ```

2. **Install gh-pages** (if not already installed):
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy manually**:
   ```bash
   npm run deploy
   ```

4. **Automatic deployment**: The GitHub Actions workflow will automatically deploy when you push to the main branch.

#### Manual Build

To create a production build:
```bash
npm run build
```

The build files will be created in the `build/` directory.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **CSS3** - Modern styling with gradients and animations
- **Create React App** - Zero-configuration build tool

## Best Practices Implemented

- **Component Architecture**: Modular, reusable components
- **Type Safety**: Full TypeScript implementation
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Proper focus management and keyboard navigation
- **Performance**: Optimized rendering and state management
- **Clean Code**: Well-structured, readable codebase

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Word list compiled from common English words
- Design inspired by modern typing test applications
- Built with best practices for React and TypeScript development
