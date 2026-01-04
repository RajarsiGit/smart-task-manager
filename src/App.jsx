import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import HomeScreen from "./components/HomeScreen";
import CalendarScreen from "./components/CalendarScreen";
import TaskDetailScreen from "./components/TaskDetailScreen";
import CreateProject from "./components/CreateProject";
import ProjectDetailScreen from "./components/ProjectDetailScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import ProfileSettings from "./components/ProfileSettings";

function AppContent() {
  const { user, updateUserProfile } = useApp();

  const handleWelcomeComplete = (userData) => {
    updateUserProfile(userData);
  };

  if (!user) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/calendar" element={<CalendarScreen />} />
          <Route path="/task/:id" element={<TaskDetailScreen />} />
          <Route path="/project/:id/view" element={<ProjectDetailScreen />} />
          <Route path="/project/:id" element={<CreateProject />} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
