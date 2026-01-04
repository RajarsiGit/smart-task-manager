import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { projectsApi, tasksApi } from "../utils/api";
import LoadingSpinner from "./LoadingSpinner";

const HomeScreen = () => {
  const navigate = useNavigate();
  const { projects, tasks, user, removeProject, loading, setProjects, setTasks } = useApp();
  const [activeTab, setActiveTab] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        } catch (error) {
          console.error("Error refreshing data:", error);
          // Keep existing data on error
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    refreshData();
  }, []); // Only run on mount

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "progress") return task.status === "in_progress";
    if (activeTab === "completed") return task.status === "completed";
    return false;
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
    if (!task.projectId) return null;
    return projects.find((p) => p.id === task.projectId);
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
      } catch (error) {
        console.error("Error deleting project:", error);
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

  if (loading || isRefreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      {isDeleting && <LoadingSpinner fullScreen />}
      <div className="w-full max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1">
                  Hello {user?.name || "User"}!
                </h1>
                <p className="text-gray-500">Have a nice day</p>
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
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"
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
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"
                  onClick={() => navigate("/profile")}
                >
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
                </button>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Projects</h2>
              {projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <p className="text-gray-400 mb-4">No projects yet</p>
                  <button
                    onClick={() => navigate("/project/new")}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      className={`${project.color} rounded-2xl p-6 text-white cursor-pointer transform transition hover:scale-105 relative group text-left w-full`}
                      onClick={() => navigate(`/project/${project.id}/view`)}
                      aria-label={`View ${project.title} project`}
                    >
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleEditProject(e, project.id)}
                          className="bg-white/20 p-2 rounded hover:bg-white/30"
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
                  ))}
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tasks</h2>
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
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                onClick={() => navigate("/profile")}
              >
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
              </button>
            </div>

            <h1 className="text-2xl font-bold mb-1">
              Hello {user?.name || "User"}!
            </h1>
            <p className="text-gray-500 text-sm mb-6">Have a nice day</p>

            <div className="flex gap-4 border-b pb-4 mb-6">
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

            {/* Project Cards */}
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No projects yet</p>
                  <button
                    onClick={() => navigate("/project/new")}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
                  >
                    Create Your First Project
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    className={`${project.color} rounded-2xl p-5 text-white cursor-pointer transform transition hover:scale-105 relative group text-left w-full`}
                    onClick={() => navigate(`/project/${project.id}/view`)}
                    aria-label={`View ${project.title} project`}
                  >
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleEditProject(e, project.id)}
                        className="bg-white/20 p-1.5 rounded hover:bg-white/30"
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
                      <span className="text-sm opacity-90">{project.name}</span>
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
              <h2 className="text-lg font-bold">{getTaskSectionTitle()}</h2>
              <button
                onClick={() => navigate("/task/new")}
                className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm hover:bg-purple-700 transition"
              >
                + New Task
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
