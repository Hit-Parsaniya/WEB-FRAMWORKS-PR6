# Practical 3: API Integration and Data Rendering in React

## Objective

Fetch repository data from a public REST API and render it in the Projects page while handling loading, error, and success states.

## API integration

The Projects page requests repositories for the GitHub user `Hit-Parsaniya` from the GitHub REST API. It fetches the data when the page loads, checks for unsuccessful HTTP responses, and excludes forked repositories from the displayed results.

The page provides:

- A loading message and spinner while the request is in progress
- An error message and retry action if the request fails
- A searchable repository list with repository links, descriptions, languages, update dates, and star counts when available

The GitHub username can be changed in `src/pages/ProjectsPage.jsx` by updating `GITHUB_USERNAME`.

## Run locally

From the project directory:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal. Visit `/projects` to view the repositories. An internet connection is needed to retrieve live data from GitHub.

## Concepts demonstrated

- Fetching API data with `fetch`
- Triggering a side effect with `useEffect`
- Tracking data, loading, and error state with `useState`
- Conditional rendering for loading, error, and success
- Filtering rendered results with a search input

## Learning outcome

Practice integrating a public API into a React interface and providing useful feedback throughout an asynchronous request.
