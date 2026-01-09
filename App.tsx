
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { User, Mistake, AppRoute } from './types';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MistakesPage from './pages/MistakesPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted state
    const savedUser = localStorage.getItem('nova_user');
    const savedMistakes = localStorage.getItem('nova_mistakes');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedMistakes) {
      setMistakes(JSON.parse(savedMistakes));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('nova_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nova_user');
  };

  const updatePoints = useCallback((amount: number) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, points: Math.max(0, prev.points + amount) };
      localStorage.setItem('nova_user', JSON.stringify(newUser));
      return newUser;
    });
  }, []);

  const addMistake = useCallback((mistake: Omit<Mistake, 'id' | 'timestamp'>) => {
    const newMistake: Mistake = {
      ...mistake,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setMistakes(prev => {
      const newList = [newMistake, ...prev];
      localStorage.setItem('nova_mistakes', JSON.stringify(newList));
      return newList;
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path={`/${AppRoute.LOGIN}`} 
          element={user ? <Navigate to={`/${AppRoute.HOME}`} /> : <LoginPage onLogin={handleLogin} />} 
        />
        <Route 
          path={`/${AppRoute.HOME}`} 
          element={
            user ? 
            <HomePage 
              user={user} 
              onUpdatePoints={updatePoints} 
              onAddMistake={addMistake} 
              onLogout={handleLogout}
            /> : 
            <Navigate to={`/${AppRoute.LOGIN}`} />
          } 
        />
        <Route 
          path={`/${AppRoute.MISTAKES}`} 
          element={
            user ? 
            <MistakesPage mistakes={mistakes} /> : 
            <Navigate to={`/${AppRoute.LOGIN}`} />
          } 
        />
        <Route path="*" element={<Navigate to={user ? `/${AppRoute.HOME}` : `/${AppRoute.LOGIN}`} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
