import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTheme } from "../context/ThemeContext";
import { projectsApi, tasksApi } from "../utils/api";
import LoadingSpinner from "./LoadingSpinner";

const HomeScreen = () => {
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    user,
    removeProject,
    loading,
    setProjects,
    setTasks,
    logout,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch fresh data from API when component mounts
  useEffect(() => {
    const refreshData = async () => {
      const useApi = Boolean(import.meta.env.VITE_USE_API !== "false");

      if (useApi && !loading) {
        setIsRefreshing(true);
        try {
          const [projectsData, tasksData] = await Promise.all([
            projectsApi.getAll(),
            tasksApi.getAll(),
          ]);
          setProjects(projectsData);
          setTasks(tasksData);
        } catch {
          // Keep existing data on error
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshData();
  }, []); // Only run on mount

  const filteredTasks = tasks.filter((task) => {
    // First filter by active tab
    let passesTabFilter = true;
    if (activeTab === "progress")
      passesTabFilter = task.status === "in_progress";
    else if (activeTab === "completed")
      passesTabFilter = task.status === "completed";

    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title?.toLowerCase().includes(query);
      const matchesDescription = task.description
        ?.toLowerCase()
        .includes(query);
      const matchesTags = task.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );
      const matchesCategories = task.categories?.some((cat) =>
        cat.toLowerCase().includes(query)
      );
      return (
        passesTabFilter &&
        (matchesTitle || matchesDescription || matchesTags || matchesCategories)
      );
    }

    return passesTabFilter;
  });

  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name?.toLowerCase().includes(query) ||
      project.title?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTaskProject = (task) => {
    // Handle both camelCase (projectId) and snake_case (project_id) from API
    const taskProjectId = task.projectId || task.project_id;
    if (!taskProjectId) return null;
    return projects.find((p) => p.id === taskProjectId);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleDeleteProject = (e, projectId) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      setIsDeleting(true);
      try {
        await removeProject(projectToDelete);
        setShowDeleteModal(false);
        setProjectToDelete(null);
      } catch {
        alert("Failed to delete project. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const getTaskSectionTitle = () => {
    if (activeTab === "all") return "All Tasks";
    if (activeTab === "progress") return "In Progress";
    return "Completed";
  };

  const handleEditProject = (e, projectId) => {
    e.stopPropagation();
    navigate(`/project/${projectId}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || isRefreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      {(isDeleting || isLoggingOut) && <LoadingSpinner fullScreen />}
      <div className="w-full max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-8 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1 dark:text-white">
                  Hello {user?.name || "User"}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Have a nice day
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/project/new")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
                >
                  + New Project
                </button>
                <button
                  onClick={() => navigate("/task/new")}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium"
                >
                  + New Task
                </button>
                <button
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => navigate("/calendar")}
                  title="Calendar"
                >
                  <svg
                    className="w-6 h-6 dark:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={toggleTheme}
                  title={`Switch to ${
                    theme === "light" ? "dark" : "light"
                  } mode`}
                >
                  {theme === "light" ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  )}
                </button>
                <button
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 overflow-hidden"
                  onClick={() => navigate("/profile")}
                  title="Profile"
                >
                  {user?.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <button
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects and tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Projects Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">
                Projects {searchQuery && `(${filteredProjects.length})`}
              </h2>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <p className="text-gray-400 mb-4">
                    {searchQuery ? "No projects found" : "No projects yet"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => navigate("/project/new")}
                      className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
                    >
                      Create Your First Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`${project.color} rounded-2xl transform transition hover:scale-105 relative group overflow-hidden`}
                    >
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
                        <button
                          onClick={(e) => handleEditProject(e, project.id)}
                          className="bg-white/20 p-2 rounded hover:bg-white/30"
                          aria-label={`Edit ${project.title}`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="bg-white/20 p-2 rounded hover:bg-red-500"
                          aria-label={`Delete ${project.title}`}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/project/${project.id}/view`)}
                        className="w-full p-6 text-white text-left"
                        aria-label={`View ${project.title} project`}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <div className="bg-white/20 p-2 rounded">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                          </div>
                          <span className="text-sm opacity-90">
                            {project.name}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {project.title}
                        </h3>
                        {project.date && (
                          <p className="text-sm opacity-75">
                            {formatDate(project.date)}
                          </p>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold dark:text-white">
                  Tasks {searchQuery && `(${filteredTasks.length})`}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg transition ${
                      activeTab === "all"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("progress")}
                    className={`px-4 py-2 rounded-lg transition ${
                      activeTab === "progress"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-2 rounded-lg transition ${
                      activeTab === "completed"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400">No tasks found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTasks.map((task) => {
                    const project = getTaskProject(task);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl cursor-pointer transition w-full text-left"
                        onClick={() => navigate(`/task/${task.id}`)}
                        aria-label={`View task: ${task.title}`}
                      >
                        <div className="relative">
                          <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-6 h-6 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          {task.priority && (
                            <div
                              className={`absolute -top-1 -right-1 w-4 h-4 ${getPriorityColor(
                                task.priority
                              )} rounded-full border-2 border-white`}
                              title={`${task.priority} priority`}
                            ></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-700 font-medium block truncate">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatDate(task.date)}
                            </span>
                            {project && (
                              <>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-purple-600 font-medium">
                                  {project.title}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        {task.status === "completed" && (
                          <svg
                            className="w-6 h-6 text-green-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden w-full max-w-md mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => navigate("/project/new")}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                onClick={() => navigate("/calendar")}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 overflow-hidden"
                onClick={() => navigate("/profile")}
                title="Profile"
              >
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
              <button
                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                onClick={handleLogout}
                title="Logout"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>

            <h1 className="text-2xl font-bold mb-1">
              Hello {user?.name || "User"}!
            </h1>
            <p className="text-gray-500 text-sm mb-4">Have a nice day</p>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Project Cards */}
            <div className="space-y-4">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    {searchQuery ? "No projects found" : "No projects yet"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => navigate("/project/new")}
                      className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
                    >
                      Create Your First Project
                    </button>
                  )}
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`${project.color} rounded-2xl transform transition hover:scale-105 relative group overflow-hidden`}
                  >
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
                      <button
                        onClick={(e) => handleEditProject(e, project.id)}
                        className="bg-white/20 p-1.5 rounded hover:bg-white/30"
                        aria-label={`Edit ${project.title}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="bg-white/20 p-1.5 rounded hover:bg-red-500"
                        aria-label={`Delete ${project.title}`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/project/${project.id}/view`)}
                      className="w-full p-5 text-white text-left"
                      aria-label={`View ${project.title} project`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-white/20 p-1.5 rounded">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          </svg>
                        </div>
                        <span className="text-sm opacity-90">
                          {project.name}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {project.title}
                      </h3>
                      {project.date && (
                        <p className="text-sm opacity-75">
                          {formatDate(project.date)}
                        </p>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Project Button */}
            {projects.length > 0 && (
              <button
                onClick={() => navigate("/project/new")}
                className="w-full mt-4 py-3 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-semibold hover:bg-purple-50 transition"
              >
                + Add New Project
              </button>
            )}
          </div>

          {/* Tasks Section */}
          <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {getTaskSectionTitle()}{" "}
                {searchQuery && `(${filteredTasks.length})`}
              </h2>
              <button
                onClick={() => navigate("/task/new")}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm hover:bg-purple-700 transition"
              >
                + New Task
              </button>
            </div>

            {/* Task Filter Tabs */}
            <div className="flex gap-4 border-b pb-4 mb-4">
              <button
                onClick={() => setActiveTab("all")}
                className={`pb-2 ${
                  activeTab === "all"
                    ? "border-b-2 border-purple-600 text-purple-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                My Tasks
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`pb-2 ${
                  activeTab === "progress"
                    ? "border-b-2 border-purple-600 text-purple-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                In progress
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`pb-2 ${
                  activeTab === "completed"
                    ? "border-b-2 border-purple-600 text-purple-600 font-semibold"
                    : "text-gray-400"
                }`}
              >
                Completed
              </button>
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No tasks found</p>
              ) : (
                filteredTasks.map((task) => {
                  const project = getTaskProject(task);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition w-full text-left"
                      onClick={() => navigate(`/task/${task.id}`)}
                      aria-label={`View task: ${task.title}`}
                    >
                      <div className="relative">
                        <div className="bg-purple-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        {task.priority && (
                          <div
                            className={`absolute -top-1 -right-1 w-3 h-3 ${getPriorityColor(
                              task.priority
                            )} rounded-full border-2 border-white`}
                            title={`${task.priority} priority`}
                          ></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-700 font-medium block truncate">
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatDate(task.date)}
                          </span>
                          {project && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-purple-600 font-medium truncate">
                                {project.title}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {task.status === "completed" && (
                        <svg
                          className="w-5 h-5 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full animate-fadeIn">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">
                Delete Project?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this project? All associated
                tasks will also be deleted. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomeScreen;
