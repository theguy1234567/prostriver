# ProStriver App Folder Structure

## Root
- eslint.config.js
- index.html
- package.json
- README.md
- vite.config.js
- public/

## src
- App_layout.jsx
- App.css
- App.jsx
- index.css
- Landing_layout.jsx
- main.jsx
- ProtectedRoutes.jsx
- assets/
  - Fonts/

- components/
  - app_components/
    - App_footer.jsx
    - App_nav.jsx
    - ChallengeCard.jsx
    - RecentTopics.jsx
    - StatsCards.jsx
    - TodayRevisions.jsx
    - challenges/
      - ActiveChallengeCard.jsx
      - ChallengeCard.jsx
    - revisoncomponents/
      - RevisionCard.jsx
      - RevisionList.jsx
  - landing_components/
    - Footer.jsx
    - Navbar.jsx

- context/
  - ThemeContext.jsx

- pages/
  - app/
    - Challenges.jsx
    - Dashboard.jsx
    - Profile.jsx
    - Revisions.jsx
    - Topics.jsx
  - Landing/
    - Home.jsx
    - Login.jsx
    - Signup.jsx
  - models/
    - AddTopicForm.jsx

- utils/
  - apiFetch.js
