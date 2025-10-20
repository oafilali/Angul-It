# Angul-It: A Multi-Stage Captcha Application

Angul-It is a web application built with Angular that presents users with a series of challenges to prove they are not a bot. It demonstrates core Angular concepts including component architecture, state management with RxJS, routing, and animations.

## Features

- **Multi-Stage Challenges:** Users must complete a series of challenges (math problems, text entry).
- **State Management:** User progress is managed through an RxJS-powered state service.
- **State Persistence:** Progress is saved to `localStorage`, so it remains intact even after a page refresh.
- **Routing Guards:** Prevents direct URL access to the results page without completing the challenges.
- **Dynamic Animations:** Smooth, dynamic animations between challenge stages.
- **Responsive Design:** A clean UI that works on both desktop and mobile devices.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You will need to have the following software installed on your machine:

- [Node.js](https://nodejs.org/en/) (which includes npm)

### Installation

1. Clone the repository to your local machine.
2. Navigate into the project directory:
   ```bash
   cd angul-it
   ```
3. Install the required dependencies using npm:
   ```bash
   npm install
   ```

### Running the Application

Once the dependencies are installed, you can start the local development server:

```bash
npm start
```

This command runs `ng serve`. Open your browser and navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `dist/` folder.
- `npm test`: Runs the unit tests with Karma.