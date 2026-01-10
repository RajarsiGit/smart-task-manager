import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import LoadingSpinner from "./LoadingSpinner";
import { tasksApi } from "../utils/api";

const TaskDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { createTask, editTask, removeTask, projects, tasks, selectedDate } =
    useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isNewTask = id === "new";
  const projectIdFromQuery = searchParams.get("projectId");

  const getFormattedDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: isNewTask
      ? getFormattedDate(selectedDate)
      : getFormattedDate(new Date()),
    startTime: "",
    endTime: "",
    tags: [],
    categories: [],
    status: "in_progress",
    priority: "medium",
    projectId: projectIdFromQuery ? Number.parseInt(projectIdFromQuery) : null,
  });

  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Get the project associated with this task (either from query param or from task data)
  const getAssociatedProject = () => {
    const projectId = projectIdFromQuery
      ? Number.parseInt(projectIdFromQuery)
      : formData.projectId;
    return projectId ? projects.find((p) => p.id === projectId) : null;
  };

  const associatedProject = getAssociatedProject();

  const availableTags = [
    "Design",
    "Meeting",
    "Coding",
    "Testing",
    "Planning",
    "Review",
  ];
  const availableCategories = [
    "UI",
    "Testing",
    "Quick call",
    "Backend",
    "Frontend",
    "DevOps",
  ];

  useEffect(() => {
    const fetchTask = async () => {
      if (!isNewTask && id) {
        const useApi = Boolean(import.meta.env.VITE_USE_API !== "false");

        if (useApi) {
          setIsLoading(true);
          try {
            const task = await tasksApi.getById(id);

            if (task) {
              setFormData({
                title: task.title,
                description: task.description || "",
                date: new Date(task.date).toISOString().split("T")[0],
                startTime: task.startTime || task.start_time || "",
                endTime: task.endTime || task.end_time || "",
                tags: task.tags || [],
                categories: task.categories || [],
                status: task.status || "pending",
                priority: task.priority || "medium",
                projectId: task.projectId || task.project_id || null,
              });
            }
          } catch (error) {
            // Fallback to tasks from context
            const task = tasks.find((t) => t.id === Number.parseInt(id));
            if (task) {
              setFormData({
                title: task.title,
                description: task.description || "",
                date: new Date(task.date).toISOString().split("T")[0],
                startTime: task.startTime || "",
                endTime: task.endTime || "",
                tags: task.tags || [],
                categories: task.categories || [],
                status: task.status || "pending",
                priority: task.priority || "medium",
                projectId: task.projectId || null,
              });
            }
          } finally {
            setIsLoading(false);
          }
        } else {
          // API disabled, use tasks from context
          const task = tasks.find((t) => t.id === Number.parseInt(id));
          if (task) {
            setFormData({
              title: task.title,
              description: task.description || "",
              date: new Date(task.date).toISOString().split("T")[0],
              startTime: task.startTime || "",
              endTime: task.endTime || "",
              tags: task.tags || [],
              categories: task.categories || [],
              status: task.status || "pending",
              priority: task.priority || "medium",
              projectId: task.projectId || null,
            });
          }
        }
      }
    };

    fetchTask();
  }, [id, isNewTask, tasks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const toggleCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const addCustomCategory = () => {
    if (
      newCategory.trim() &&
      !formData.categories.includes(newCategory.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }));
      setNewCategory("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const taskData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        projectId: formData.projectId
          ? Number.parseInt(formData.projectId)
          : null,
      };

      if (isNewTask) {
        await createTask(taskData);
      } else {
        await editTask(id, taskData);
      }
      navigate("/");
    } catch (error) {
      alert("Failed to save task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await removeTask(id);
      setShowDeleteModal(false);
      navigate("/");
    } catch (error) {
      alert("Failed to delete task. Please try again.");
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const setStatus = (status) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const setPriority = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  return (
    <>
      {(isSaving || isDeleting || isLoading) && <LoadingSpinner fullScreen />}
      <div className="w-full max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl shadow-xl p-6 lg:p-8 text-white"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="text-sm opacity-90">
                {isNewTask ? "Create Task" : "Edit Task"}
              </span>
              {!isNewTask && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-500 rounded-full"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              {isNewTask && <div className="w-10"></div>}
            </div>

            {/* Breadcrumb */}
            {associatedProject && (
              <div className="flex items-center gap-2 mt-4 text-sm opacity-90">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/project/${associatedProject.id}/view`)
                  }
                  className="hover:underline"
                >
                  {associatedProject.title}
                </button>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span>{isNewTask ? "New Task" : "Edit Task"}</span>
              </div>
            )}
          </div>

          {/* Task Info */}
          <div className="mb-6 space-y-4">
            <div>
              <label
                htmlFor="task-title"
                className="text-sm opacity-75 mb-2 block"
              >
                Task Name
              </label>
              <input
                id="task-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task name"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-base lg:text-lg"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-date"
                  className="text-sm opacity-75 mb-2 block"
                >
                  Date
                </label>
                <input
                  id="task-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 white-icons"
                />
              </div>

              <div>
                <label
                  htmlFor="task-project"
                  className="text-sm opacity-75 mb-2 block"
                >
                  Project (Optional)
                </label>
                <select
                  id="task-project"
                  name="projectId"
                  value={formData.projectId || ""}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 white-icons"
                >
                  <option value="" className="text-gray-900">
                    No Project
                  </option>
                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                      className="text-gray-900"
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="task-start-time"
                  className="text-sm opacity-75 mb-2 block"
                >
                  Start Time
                </label>
                <input
                  id="task-start-time"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 white-icons"
                />
              </div>
              <div>
                <label
                  htmlFor="task-end-time"
                  className="text-sm opacity-75 mb-2 block"
                >
                  End Time
                </label>
                <input
                  id="task-end-time"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 white-icons"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="task-description"
              className="text-sm opacity-75 mb-2 block"
            >
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          {/* Tags */}
          <fieldset className="mb-4">
            <legend className="text-sm opacity-75 mb-2 block">Tags</legend>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    formData.tags.includes(tag)
                      ? "bg-purple-800 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {formData.tags
              .filter((t) => !availableTags.includes(t))
              .map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-4 py-2 bg-purple-800 rounded-full text-sm font-medium text-white mr-2 mb-2"
                >
                  {tag}
                </span>
              ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add custom tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-4 py-2 bg-white/20 rounded-xl text-sm hover:bg-white/30"
              >
                Add
              </button>
            </div>
          </fieldset>

          {/* Categories */}
          <fieldset className="mb-6">
            <legend className="text-sm opacity-75 mb-2 block">
              Categories
            </legend>
            <div className="flex flex-wrap gap-2 mb-3">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    formData.categories.includes(category)
                      ? "bg-purple-800 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {formData.categories
              .filter((c) => !availableCategories.includes(c))
              .map((category) => (
                <span
                  key={category}
                  className="inline-block px-4 py-2 bg-purple-800 rounded-full text-sm font-medium text-white mr-2 mb-2"
                >
                  {category}
                </span>
              ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add custom category"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCategory();
                  }
                }}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="button"
                onClick={addCustomCategory}
                className="px-4 py-2 bg-white/20 rounded-xl text-sm hover:bg-white/30"
              >
                Add
              </button>
            </div>
          </fieldset>

          {/* Priority */}
          <fieldset className="mb-6">
            <legend className="text-sm opacity-75 mb-2 block">Priority</legend>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPriority("low")}
                className={`py-3 rounded-xl font-semibold transition ${
                  formData.priority === "low"
                    ? "bg-blue-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority("medium")}
                className={`py-3 rounded-xl font-semibold transition ${
                  formData.priority === "medium"
                    ? "bg-yellow-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority("high")}
                className={`py-3 rounded-xl font-semibold transition ${
                  formData.priority === "high"
                    ? "bg-red-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                High
              </button>
            </div>
          </fieldset>

          {/* Status Buttons */}
          {!isNewTask && (
            <fieldset className="mb-6">
              <legend className="text-sm opacity-75 mb-2 block">Status</legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus("in_progress")}
                  className={`py-3 rounded-xl font-semibold transition ${
                    formData.status === "in_progress"
                      ? "bg-yellow-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {formData.status === "in_progress"
                    ? "In Progress"
                    : "Mark as In Progress"}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("completed")}
                  className={`py-3 rounded-xl font-semibold transition ${
                    formData.status === "completed"
                      ? "bg-green-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {formData.status === "completed"
                    ? "Completed"
                    : "Mark as Completed"}
                </button>
              </div>
            </fieldset>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            {isNewTask ? "Create Task" : "Update Task"}
          </button>
        </form>

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
              <h3 className="text-xl font-bold text-center mb-2 text-gray-900">
                Delete Task?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this task? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
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

export default TaskDetailScreen;
