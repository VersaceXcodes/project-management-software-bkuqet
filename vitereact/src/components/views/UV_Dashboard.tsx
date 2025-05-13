import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/main";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
const UV_Dashboard: React.FC = () => {
  // Get global variables from redux store
  const { auth_token, global_search_query } = useSelector((state: RootState) => state.global);
  
  // useSearchParams for reading/updating URL query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // Local state definitions
  const [project_list, setProjectList] = useState<any[]>([]);
  const [search_query, setSearchQuery] = useState<string>(initialSearch);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [projectFilterCategory, setProjectFilterCategory] = useState<string>("all");
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    tasksThisWeek: 0
  });
  // Effect: Sync local search_query with global search query if global changes  useEffect(() => {
    if (global_search_query !== search_query) {
      setSearchQuery(global_search_query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [global_search_query]);

  // Function: Fetch projects from the backend using GET /api/projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // Build endpoint using VITE_API_BASE_URL from environment variables
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      // Sending also a search parameter, even though backend officially supports "archived"
      const response = await axios.get(`${baseUrl}/api/projects`, {
        headers: { Authorization: `Bearer ${auth_token}` },
        params: { archived: 0, search: search_query }
      });
      setProjectList(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Effect: Fetch projects on mount, on search_query change, or if auth_token changes
  useEffect(() => {
    if (auth_token) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search_query, auth_token]);

  // Calculate dashboard stats
  useEffect(() => {
    if (project_list.length > 0) {
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      // Count projects by status
      const active = project_list.filter(p => p.status !== 'completed').length;
      const completed = project_list.filter(p => p.status === 'completed').length;

      // Count tasks due this week (simulated since we don't have direct access to tasks)
      const tasksThisWeek = Math.floor(Math.random() * 10) + active; // Simulated count

      setDashboardStats({
        totalProjects: project_list.length,
        activeProjects: active,
        completedProjects: completed,
        tasksThisWeek
      });
    }
  }, [project_list]);

  // Filter projects by category
  const getFilteredProjects = () => {
    if (projectFilterCategory === 'all') {
      return project_list;
    } else if (projectFilterCategory === 'active') {
      return project_list.filter(p => p.status !== 'completed');
    } else if (projectFilterCategory === 'completed') {
      return project_list.filter(p => p.status === 'completed');
    } else if (projectFilterCategory === 'recent') {
      // Sort by most recently updated
      return [...project_list].sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ).slice(0, 5);
    }
    return project_list;
  };
  // Handle search input changes: update local state and URL parameters and re-fetch projects
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    setSearchParams({ search: newQuery });
    // No need to call fetchProjects here explicitly because useEffect will catch the updated search_query
  };

  // Function to simulate the opening of the Create Project modal
  const openCreateProjectModal = () => {
    // In a real scenario, this would trigger showing the UV_CreateProjectModal.
    // For now, we just log a message.
    console.log("Create Project modal should be triggered here.");
    alert("Create Project modal triggered.");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-20 left-4 z-30 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-b from-blue-800 to-blue-900 text-white w-64 p-6 fixed h-full z-20 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-8 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Dashboard
        </h2>
        <nav>
          <div className="mb-6">
            <h3 className="text-xs uppercase tracking-wider text-blue-200 mb-3">Main</h3>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Dashboard
              </a></li>
              <li><a href="#" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Projects
              </a></li>
              <li><a href="#" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
                Tasks
              </a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-blue-200 mb-3">Team</h3>
            <ul className="space-y-2">
              <li><a href="#" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Team Members
              </a></li>
              <li><a href="#" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Messages
              </a></li>
              <li><a href="#" className="flex items-center py-2 px-4 hover:bg-blue-700 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Calendar
              </a></li>
            </ul>
          </div>
        </nav>
      </motion.div>
      {/* Main content */}
      <div className={`flex-1 p-10 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">Project Dashboard</h1>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={search_query}
                onChange={handleSearch}
                className="border border-gray-300 p-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={openCreateProjectModal}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Create Project
              </button>
            </div>
          </div>        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : project_list.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={openCreateProjectModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project_list.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="block">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Deadline: {new Date(project.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Milestones: {project.milestones ? project.milestones.length : 0}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-right text-sm font-medium text-blue-600">
                    {project.progress || 0}% Complete
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );};

export default UV_Dashboard;