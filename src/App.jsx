import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import DatasetList from "./pages/DatasetList";
import DatasetDetail from "./pages/DatasetDetail";
import LoginPage from "./pages/LoginPage"; 
import UploadDataset from "./pages/UploadDataset";
import EditMetadata from "./pages/EditMetadata";

// Import komponen Shadcn UI yang diperlukan
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Untuk menu mobile
import { Menu } from "lucide-react"; // Ikon hamburger dari lucide-react

function App() {
  const { auth, logout } = useAuth();
  const isAuthenticated = auth; // Variabel yang lebih jelas

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen flex flex-col"> {/* Mengubah bg-gray-100 ke bg-gray-50 dan menambahkan flex-col */}
        {/* Navbar */}
        <nav className="bg-white shadow-sm sticky top-0 z-50"> {/* shadow-sm, sticky top-0, z-50 untuk navbar tetap di atas */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            {/* Logo/Nama Aplikasi */}
            <Link to="/" className="font-bold text-xl text-gray-900 hover:text-gray-700 transition-colors">
              ML Datasets
            </Link>

            {/* Navigasi Desktop & Mobile Toggle */}
            <div className="flex items-center gap-4">
              {/* Navigasi Desktop */}
              <div className="hidden md:flex items-center gap-4"> {/* md:flex untuk tampilan di desktop */}
                {isAuthenticated && (
                  <>
                    <Link to="/upload">
                      <Button variant="ghost">Upload</Button>
                    </Link>
                    {/* Tambahkan link lain untuk desktop jika diperlukan */}
                  </>
                )}
                {isAuthenticated ? (
                  <Button variant="outline" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button>Login</Button>
                  </Link>
                )}
              </div>

              {/* Navigasi Mobile (Hamburger Menu) */}
              <div className="md:hidden"> {/* Hanya terlihat di mobile */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" /> 
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[200px] sm:w-[250px] px-1"> 
                    <nav className="flex flex-col gap-4 mt-6">
                      <Link to="/" onClick={() => document.querySelector('[data-radix-sheet-content]')?.click()} className="block py-2 text-gray-700 hover:text-blue-600">Home</Link>
                      {isAuthenticated && (
                        <Link to="/upload" onClick={() => document.querySelector('[data-radix-sheet-content]')?.click()} className="block py-2 text-gray-700 hover:text-blue-600">Upload Dataset</Link>
                      )}
                      {isAuthenticated ? (
                        <Button variant="outline" onClick={() => { logout(); document.querySelector('[data-radix-sheet-content]')?.click(); }}>
                          Logout
                        </Button>
                      ) : (
                        <Link to="/login">
                          <Button className="w-full" onClick={() => document.querySelector('[data-radix-sheet-content]')?.click()}>Login</Button>
                        </Link>
                      )}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>

        {/* Konten Halaman */}
        <main className="flex-grow"> {/* flex-grow agar konten mengisi ruang kosong */}
          <Routes>
            <Route path="/" element={<DatasetList />} />
            <Route path="/login" element={<LoginPage />} /> {/* Pastikan LoginPage dirender */}
            <Route path="/upload" element={isAuthenticated ? <UploadDataset /> : <Navigate to="/login" />} />
            <Route path="/edit/:name" element={isAuthenticated ? <EditMetadata /> : <Navigate to="/login" />} />
            <Route path="/dataset/:name" element={<DatasetDetail />} />
            {/* Redirect semua path yang tidak cocok ke home atau login */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;