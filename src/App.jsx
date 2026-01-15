import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import HomeScreen from "./components/HomeScreen";
import CalendarScreen from "./components/CalendarScreen";
import TaskDetailScreen from "./components/TaskDetailScreen";
import CreateProject from "./components/CreateProject";
import ProjectDetailScreen from "./components/ProjectDetailScreen";
import AuthScreen from "./components/AuthScreen";
import ProfileSettings from "./components/ProfileSettings";
import LoadingSpinner from "./components/LoadingSpinner";

function AppContent() {
  const { user, loadData, loading } = useApp();

  // Handle OAuth callback success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get("auth");

    if (authSuccess === "success") {
      // Clear URL params and reload data
      window.history.replaceState({}, document.title, window.location.pathname);
      loadData();
    }
  }, [loadData]);

  const handleAuthSuccess = async () => {
    // Reload data after successful authentication
    await loadData();
  };

  // Show loader while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900 transition-colors">
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
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
