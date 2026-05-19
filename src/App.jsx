import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout.jsx";
import Signup from "./pages/Signup";
import Login from "./pages/Login/Login.jsx";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Books from "./pages/Books.jsx";
import BookDetail from "./pages/BookDetail.jsx";
import BookForm from "./pages/BookForm.jsx";
import ShelfDetail from "./pages/ShelfDetail";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { OnBoarding } from "./pages/OnBoarding.jsx";
import AuthorBooks from "./pages/AuthorBooks.jsx";
import ChapterEdit from "./pages/ChapterEdit.jsx";
import WorkspaceLayout from "./layouts/WorkspaceLayout.jsx";
import AdminRequests from "./pages/AdminRequests.jsx";
import AuthorRequests from "./pages/AuthorRequests.jsx";

export default function App() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  useEffect(() => {
    const handler = () => {
      logout();
      navigate("/login");
    };

    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [logout, navigate]);
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="books" element={<Books />} />

        <Route
          path="books/new"
          element={
            <ProtectedRoute>
              <BookForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="books/:id/edit"
          element={
            <ProtectedRoute>
              <BookForm mode="edit" />
            </ProtectedRoute>
          }
        />

        <Route
          path="author/onboarding"
          element={
            <ProtectedRoute>
              <OnBoarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="author/my-books"
          element={
            <ProtectedRoute>
              <AuthorBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="author/requests"
          element={
            <ProtectedRoute allowedRoles={["author"]}>
              <AuthorRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/requests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminRequests />
            </ProtectedRoute>
          }
        />
        <Route path="books/:id" element={<BookDetail />} />

        <Route path="shelves/:id" element={<ShelfDetail />} />
      </Route>
      <Route path="books/:id/chapters" element={<WorkspaceLayout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <ChapterEdit />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
