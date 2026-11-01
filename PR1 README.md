# Practical 1: Introduction to React and Component Architecture

## Objective

Build a student portfolio with reusable React functional components and pass data from a parent component to its children through props.

## Components

The portfolio is divided into independently structured components:

- `Header` displays the student's name, title, and introductory actions.
- `About` displays the biography and highlights.
- `Skills` renders skill cards from a `skillList` prop.
- `Footer` displays contact and social links.

The Home page composes these components into the portfolio layout. `Header` receives values such as `name`, `title`, and `themeColor` through props; `Skills` receives its skill data through `skillList`.

## Run locally

From the project directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal.

## Concepts demonstrated

- React functional components and JSX
- Composing a page from reusable components
- Passing data and styling values through props
- Rendering a list of skills dynamically

## Learning outcome

Practice structuring a React application as reusable components and using props to provide child components with the data they display.
