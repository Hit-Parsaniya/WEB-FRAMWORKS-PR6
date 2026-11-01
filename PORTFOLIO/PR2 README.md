# Practical 2: State Management and Routing in React

## Objective

Extend the portfolio with client-side navigation and interactive UI state using React Router and React's `useState` hook.

## Routes

The application provides these routes without a full page reload:

- `/` — Home
- `/projects` — Projects
- `/contact` — Contact
- Any unmatched path — custom 404 page

`BrowserRouter` wraps the application in `src/main.jsx`. The navigation bar uses React Router links, and the routes are declared in `src/App.jsx`.

## State management

- The navigation bar's theme control switches between light and dark themes.
- The Contact page uses a controlled message input, displays a live character count and preview, and includes a visibility toggle for its writing tip.

## Run locally

From the project directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal. Use the navigation links to test each route and try the theme toggle and Contact page controls.

## Concepts demonstrated

- Defining routes with `Routes` and `Route`
- Navigating with React Router links
- Managing interactive state with `useState`
- Building a controlled form input
- Rendering a custom not-found page

## Learning outcome

Practice building a multi-route single-page application and updating its UI in response to user interactions and form input.
