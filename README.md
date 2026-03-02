# AutomationMind — Learn Automation by Solving Puzzles

AutomationMind is an interactive learning platform that teaches **automation thinking** through drag-and-drop puzzle solving — no coding, no manuals, no prior experience required.

## Core Features

### 🧩 Drag & Drop Puzzles
Arrange visual workflow blocks (triggers, conditions, actions, data transforms, outputs) in the correct order to solve real automation scenarios — like sorting emails, generating reports, or routing customer requests.

### 📈 5-Tier Progressive Difficulty
Each session contains 5 puzzles scaling through structured tiers:
1. **Linear** — Simple sequential workflows
2. **Branching (IF/ELSE)** — Decision-based routing
3. **Loops** — Repeating operations over data sets
4. **Nested Logic** — Complex multi-level conditions
5. **Error Handling (TRY/CATCH)** — Resilient automation patterns

This mirrors how real automation complexity grows in the workplace.

### 📚 Three-Phase Learning Model
1. **Pre-Puzzle Micro-Lessons** — 30-second concept explainers before each puzzle teach the "why" behind each block type.
2. **Hands-On Solving** — Active practice with immediate feedback, timers, and attempt tracking.
3. **Post-Puzzle Breakdowns** — Step-by-step walkthroughs explain why the correct order matters and map each block to real tools like Zapier, Make, and Power Automate.

### 🤖 AI-Powered Personalization
AI generates unique challenges, provides tailored learning tips after each session, and adapts to how each user solves puzzles.

### 🗺️ Skill Map & Progress Tracking
A radar-chart skill map tracks mastery across five dimensions (Triggers, Conditions, Actions, Data, Outputs), giving users a clear picture of their strengths and gaps.

### 📖 Automation Glossary
A reference page covers all five building blocks with real-world examples and translations to four major automation platforms (Zapier, Make, Power Automate, n8n).

### 🏆 Challenge Mode
AI-generated challenges push users beyond the standard curriculum with novel scenarios.

## How It Helps People Learn

- **Concept transfer** — Every puzzle maps directly to how real automation tools work. Skills learned here apply immediately to Zapier, Make, Power Automate, and n8n.
- **Active recall over passive reading** — Solving puzzles forces users to think through workflow logic rather than just watching tutorials.
- **Progressive scaffolding** — Difficulty increases systematically, ensuring foundational concepts are solid before introducing complexity.
- **Immediate feedback loops** — Wrong answers trigger explanations, not just "try again" — turning mistakes into learning moments.
- **Measurable growth** — Skill tracking and session history let users see concrete improvement over time.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Drag & Drop:** @hello-pangea/dnd
- **Animations:** Framer Motion
- **Backend:** Lovable Cloud (authentication, database, edge functions)

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start the development server
npm run dev
```

## License

This project is built with [Lovable](https://lovable.dev).
