# Graph Calculator

## Getting Started

### 1. Clone the Repository

First, clone the repository and navigate into the project folder:

```sh
git clone https://github.com/OmarMoataz21/graph-calculator.git
cd graph-calculator
```
Secondly, attach the .env files respectively.
### 2. Install Dependencies

#### Frontend
Navigate to the `frontend` folder and install dependencies:

```sh
cd frontend
npm install --force
```

#### Backend

Navigate to the `backend` folder and install dependencies:

```sh
cd backend
npm install
```

### 3.Running the Project

#### Frontend
```sh
cd frontend
npm run dev
```

#### Backend
```sh
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass (run this command if you find an authorization issue)
tsx server.ts
```

## Implementation Overview

This project was built using **React Flow** for visualizing and managing graph structures. The core functionalities include:

- **Cycle Detection**: Implemented using **Depth-First Search (DFS)** and a **visited map** to efficiently detect cyclic dependencies in the graph.
- **Cascading Updates**: Enforced using a **Relaxation Algorithm**, ensuring that updates propagate correctly across connected nodes while maintaining data consistency.
- **React Flow for Graph Rendering**: Leveraged **React Flow** to provide an interactive and dynamic graph editing experience.

These techniques ensure that the graph remains structured, accurate, and responsive to changes in real-time.

## Future Improvements

- **Better UI/UX Enhancements**: Refining the design, adding more animations, and improving accessibility.
- **Improved Responsiveness**: Ensuring the app adapts well to different screen sizes and devices.
- **Optimized Performance**: Enhancing backend efficiency and reducing frontend load times
- **Additional Features**: Having extra features, such as having sort of a version control for a specific configuration for example.
