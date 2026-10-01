import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider, useContent } from './context/ContentContext';
import AdminLogin from './components/admin/AdminLogin';
import AdminBar from './components/admin/AdminBar';
import ThemeEditor from './components/admin/ThemeEditor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import TechStack from './components/TechStack';
import Services from './components/Services';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { injectThemeCSS } from './utils/themeUtils';

function ThemeInjector() {
  const { content } = useContent();
  useEffect(() => {
    if (content?.theme) injectThemeCSS(content.theme);
  }, [content?.theme]);
  return null;
}

function Portfolio() {
  return (
    <div className="grain">
      <ThemeInjector />
      <Navbar />
      <main>
        <Hero />
        <About />
        <TechStack />
        <Services />
        <Experience />
        <Projects />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <AdminBar />
      <ThemeEditor />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#161616',
                color: '#fff',
                border: '1px solid #1f1f1f',
                fontSize: '13px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/admin" element={<AdminLogin />} />
          </Routes>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
