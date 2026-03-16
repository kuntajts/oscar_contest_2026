# 🏆 Oscar Contest Dashboard

A premium, real-time React application for tracking predictions and winners of the **Academy Awards**. This dashboard offers a seamless experience for participants to see how they rank against friends as the winners are announced live.

![Oscar Contest Preview](./public/header.png)

## ✨ Features

- **📊 Live Leaderboard**: Real-time scoring system that awards 10 points for every correct prediction.
- **🏅 Category Breakdown**: Visual cards for every Oscar category, highlighting nominees and the official winner once announced.
- **⚡ Dynamic Data Syncing**: Integrates directly with Google Sheets for participant submissions and handles live winner updates via GitHub Actions.
- **🎨 Premium Aesthetics**: A sleek "Gold & Noir" design system with smooth micro-animations, glassmorphism, and responsive layouts.
- **🛡️ Admin Suite**: A secure interface for authenticated users to update winners, triggering automated deployments.
- **🔄 Smart Polling**: Automatic data refreshing (every 30 seconds) once the ceremony starts to ensure everyone has the latest scores.

## 🚀 Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Custom Design System)
- **Data Handling**: [PapaParse](https://www.papaparse.com/) (Google Sheets Integration)
- **Visualization**: [Chart.js](https://www.chartjs.org/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) for automated `winners.json` updates.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kuntajts/oscar_contest_2026.git
   cd oscar_contest_2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_ADMIN_PASSWORD=your_secure_password
   VITE_GITHUB_OWNER=your_github_username
   VITE_GITHUB_REPO=your_repository_name
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   ```
   > [!IMPORTANT]
   > The `VITE_GITHUB_TOKEN` needs `workflow` permissions to trigger the winner update actions.

4. **Launch Development Server:**
   ```bash
   npm run dev
   ```

## 📈 Data Structure

The application relies on three primary data sources:

1. **Google Sheet**: Contains the participant names and their predictions. The URL is configured in `src/utils/config.js`.
2. **`public/nominees.json`**: The absolute source of truth for all categories and their respective nominees.
3. **`public/winners.json`**: A dynamically updated file that tracks which nominee won in each category.

## 🔐 Admin & Winner Updates

To update winners during the live event:

1. Navigate to the `/admin` route (only accessible locally or via specific deployment).
2. Authenticate with the `VITE_ADMIN_PASSWORD`.
3. Select the winners as they are announced.
4. Click **"Submit Winners to GitHub"**.
5. This triggers a GitHub Action (`update-winners.yml`) which:
   - Updates `public/winners.json` in the repository.
   - Pushes the change, triggering a new build and deployment.

## 📅 Deployment

The project is configured for **GitHub Pages**.

```bash
npm run build
```

The `dist` folder is automatically served via the `gh-pages` branch or the configured GitHub Action for deployment.

---

*Made with ❤️ for the Awards Season.*
