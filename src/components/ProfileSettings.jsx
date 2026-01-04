import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { authApi } from "../utils/api";
import LoadingSpinner from "./LoadingSpinner";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, clearAllData, logout } = useApp();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch fresh user data from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const useApi = Boolean(import.meta.env.VITE_USE_API !== "false");

      if (useApi) {
        setIsLoading(true);
        try {
          const response = await authApi.getCurrentUser();
          if (response.user) {
            setName(response.user.name || "");
            setEmail(response.user.email || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to context user data
          if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // API disabled, use user from context
        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
        }
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSaving(true);
      try {
        await updateUserProfile({ name: name.trim() });
        navigate("/");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteProfile = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await clearAllData();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting profile:", error);
      alert("Failed to delete profile. Please try again.");
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // No need to navigate - user state change will trigger AuthScreen
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show only loader while fetching initial data
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      {(isSaving || isDeleting || isLoggingOut) && (
        <LoadingSpinner fullScreen />
      )}
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 lg:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("/")}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-semibold">Profile Settings</h2>
            <div className="w-10"></div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label
                htmlFor="user-email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="user-email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed text-base lg:text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label
                htmlFor="user-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-base lg:text-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition"
            >
              Update Profile
            </button>
          </form>

          {/* Logout Section */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>

          {/* Account Deletion */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Account Deletion
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-gray-700 mb-3">
                Deleting your profile will permanently remove all your projects
                and tasks. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDeleteProfile}
                className="w-full bg-red-600 text-white py-2 rounded-xl font-semibold hover:bg-red-700 transition"
              >
                Delete Profile
              </button>
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
                Delete Profile?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete your profile? This will
                permanently remove all your projects and tasks. This action
                cannot be undone.
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

export default ProfileSettings;
