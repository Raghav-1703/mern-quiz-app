import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main>
          <AppRoutes />
        </main>
      </div>
    </AuthProvider>
  );
}
