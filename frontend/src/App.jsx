import React, { useState, createContext, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// Subcomponents
import Navigation from './components/Navigation.jsx';
import Footer from './components/Footer.jsx';
import DynamicModal from './components/DynamicModal.jsx';
import AIChatBot from './components/AIChatBot.jsx';

// Views
import HomeExchange from './views/HomeExchange.jsx';
import ExchangeFormPage from './views/ExchangeFormPage.jsx'; 
import About from './views/About.jsx';
import Help from './views/Help.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx'; 
import AuthPage from './views/Auth.jsx'; 
import ProfileSection from './views/ProfileSection.jsx';

// Styles & Assets
import './App.css';

// Create Theme Context globally
export const ThemeContext = createContext();

let logo;
try {
  logo = require('./assets/logo.png');
} catch (e) {
  logo = null;
}

export default function Pay2PayExchange() {
  const [darkMode, setDarkMode] = useState(false); 
  const [userRole, setUserRole] = useState('guest'); 
  const [activeView, setActiveView] = useState('home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [pendingView, setPendingView] = useState(null);
  const [loading, setLoading] = useState(true); 
  // App-level state configurations
  const [feeRate, setFeeRate] = useState(2);
  const [isPlatformOnline, setIsPlatformOnline] = useState('Y');

  const [userInfo, setUserInfo] = useState({
    id: null,
    name: "User Account",
    phone: "Click login profile to sync",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    profile_photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    status: "Active"
  });
  const [userTransactions, setUserTransactions] = useState([]);

  const isUserLoggedIn = userRole !== 'guest';

  const paymentDetails = {
    'Wave Pay': { name: "U Tun Tun Oo", phone: "09977123456", qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=WavePay_09977123456", color: "text-yellow-500" },
    'KBZPay': { name: "Daw Hla Hla Nu", phone: "09777123456", qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=KBZPay_09777123456", color: "text-blue-600" },
    'CB Pay': { name: "Ko Kyaw Zin Win", phone: "09444123456", qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CBPay_09444123456", color: "text-sky-500" },
    'AYA Pay': { name: "Ma Thazin Oo", phone: "09222123456", qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AYAPay_09222123456", color: "text-red-600" },
    'UAB Pay': { name: "U Aung Myo Oo", phone: "09555123456", qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UABPay_09555123456", color: "text-pink-600" },
    'TrueMoney': { name: "Ko Sai Naing", phone: "09666123456", qr: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TrueMoney_09666123456", color: "text-orange-600" }
  };

  // Shared function to pull latest system configurations from DB
  const fetchSettingsFromDatabase = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.feeRate !== undefined) setFeeRate(data.feeRate);
        if (data.isPlatformOnline !== undefined) {
          setIsPlatformOnline(data.isPlatformOnline ? 'Y' : 'N');
        }
      }
    } catch (err) {
      console.error("Failed synchronization check:", err);
    }
  };

  const fetchDatabaseRecords = async (targetId) => {
    if (!targetId) return;
    try {
      const response = await fetch(`http://localhost:5000/api/user-node/${targetId}`);
      const data = await response.json();
      if (response.ok) {
        const photoUrl = data.userInfo.profile_photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
        
        setUserInfo({
          id: data.userInfo.id || targetId,
          name: data.userInfo.name,
          phone: data.userInfo.phone,
          email: data.userInfo.email,
          role: data.userInfo.role,
          avatar: photoUrl,
          profile_photo: photoUrl,
          status: data.userInfo.status || "Active"
        });
        setUserTransactions(data.userTransactions || []);
      }
    } catch (err) {
      console.error("API Fetch Dynamic Error:", err);
    }
  };

  //  INITIAL SESSION CHECKER (Refactored)
useEffect(() => {
  const verifyUserSession = async () => {
    try {
      await fetchSettingsFromDatabase();

      // Browser Cookie check Backend 
      const response = await fetch('http://localhost:5000/api/check', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' 
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setUserRole(data.role);
        // Token Database Records
        if (data.user && data.user.id) {
          await fetchDatabaseRecords(data.user.id);
          if (data.role === 'admin') {
            setActiveView('admin');
          }
        }
      } else {
        // 💡 401 ဖြစ်တဲ့အခါ Console မှာ အနီရောင်မပြဘဲ ဒီအတိုင်း Guest အဖြစ် သတ်မှတ်လိုက်မယ်
        setUserRole('guest');
        console.log("Session Information: No active session found (User is Guest).");
      }
    } catch (error) {
      // ဒါက တကယ့် Server ပွင့်မနေတာမျိုး (Network Down) ဖြစ်မှသာ အလုပ်လုပ်မှာပါ
      console.error("Network link to auth engine failed:", error);
      setUserRole('guest');
    } finally {
      setLoading(false);
    }
  };

  verifyUserSession();
}, []);

  const handleUpdateUserInfo = async (updatedData) => {
  if (!userInfo.id) return { success: false, error: "User ID is missing." };
  try {
    const newPhoto = updatedData.profile_photo || updatedData.avatar;
    
    const payload = {
      name: updatedData.name,
      phone: updatedData.phone,
      phone_number: updatedData.phone,
      email: updatedData.email,
      profile_photo: newPhoto,
      oldPassword: updatedData.oldPassword,
      password: updatedData.password 
    };

    const response = await fetch(`http://localhost:5000/api/user-node/update/${userInfo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();

    if (response.ok && result.success) {
      setUserInfo((prev) => ({
        ...prev,
        name: updatedData.name,
        phone: updatedData.phone,
        email: updatedData.email,
        avatar: newPhoto,
        profile_photo: newPhoto
      }));
      
      await fetchDatabaseRecords(userInfo.id); 
      return { success: true }; 
    } else {
      return { success: false, error: result.error || "Failed to update profile." };
    }
  } catch (err) {
    return { success: false, error: "Connection to database failed." };
  }
};

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleLoginSuccess = (role, parsedUserData) => {
    setUserRole(role);
    setIsAuthOpen(false);
    
    if (parsedUserData) {
      const userId = parsedUserData.id || parsedUserData._id;
    
      setUserInfo((prev) => ({
        ...prev,
        id: userId,
        name: parsedUserData.name || prev.name,
        phone: parsedUserData.phone || prev.phone,
        email: parsedUserData.email || prev.email,
        status: parsedUserData.status || "Active"
      }));

      fetchDatabaseRecords(userId);
    }
    
    if (role === 'admin') {
      setPendingView(null);
      setActiveView('admin');
      return;
    }
    
    if (pendingView === 'exchange') {
      setActiveView('exchange');
      setPendingView(null);
      return;
    }
    
    setActiveView('home');
    setPendingView(null);
  };

  //LOGOUT VIA COOKIE REMOVAL
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include' 
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    setUserRole('guest');
    const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80";
    setUserInfo({
      id: null,
      name: "User Account",
      phone: "Click login profile to sync",
      avatar: defaultPhoto,
      profile_photo: defaultPhoto,
      status: "Active"
    });
    setUserTransactions([]);
    setIsAuthOpen(true); 
    setActiveView('home'); 
  };

  const navigateToView = (view) => {
    if (view === 'exchange' && userRole === 'guest') {
      setPendingView('exchange');
      setIsAuthOpen(true);
      return;
    }
    setActiveView(view);
  };

  const contextValue = { 
    darkMode, 
    setDarkMode, 
    refreshSettings: fetchSettingsFromDatabase 
  };

   {/* admin data retrieve su*/}
 if (userRole === 'admin' && activeView === 'admin') {
  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
        
        <AdminDashboard 
          onLogout={handleLogout} 
          adminData={userInfo} 
          setAdminData={handleUpdateUserInfo} 
        />
      </div>
    </ThemeContext.Provider>
  );
}

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-500 selection:bg-cyan-500/30 ${darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'}`}>
        <Navigation 
          activeView={activeView} 
          setActiveView={setActiveView} 
          navigateToView={navigateToView}
          userRole={userRole} 
          userInfo={userInfo} 
          setIsAuthOpen={setIsAuthOpen}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          logo={logo || "https://placehold.co/40x40?text=P2P"}
        />

        <button 
          type="button"
          onClick={() => setDarkMode(!darkMode)}
          className="fixed bottom-24 right-6 z-50 p-3 rounded-full shadow-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 transition-transform hover:scale-110 flex items-center justify-center"
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
        </button>

        <main className={`w-full flex-grow flex flex-col justify-center ${activeView === 'home' ? 'px-0 py-0' : 'max-w-6xl mx-auto px-4 py-8'}`}>
          {activeView === 'home' && <HomeExchange navigateToView={navigateToView} feeRate={feeRate} />}
          
          {activeView === 'exchange' && (
            <ExchangeFormPage 
              isLoggedIn={isUserLoggedIn} 
              userInfo={userInfo} 
              feeRate={feeRate}
              setUserInfo={handleUpdateUserInfo}
              onRedirectToLogin={() => {
                setPendingView('exchange');
                setIsAuthOpen(true);
              }}
              onTransactionSubmit={(txn) => setUserTransactions((prev) => [txn, ...prev])}
              paymentDetails={paymentDetails} 
              setSelectedPayment={setSelectedPayment}
              setUserTransactions={setUserTransactions}
              setActiveView={setActiveView}
            />
          )}
          
          {activeView === 'about' && <About />}
          {activeView === 'help' && <Help />}
          
          {activeView === 'profile' && (
            <ProfileSection 
              userInfo={userInfo} 
              setUserInfo={handleUpdateUserInfo} 
              userTransactions={userTransactions} 
              onLogout={handleLogout} 
              setActiveView={setActiveView}
              navigateToView={navigateToView}
            />
          )}
        </main>

        <AIChatBot /> 

        <DynamicModal 
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          paymentDetails={paymentDetails}
          copiedField={copiedField}
          handleCopy={handleCopy}
        />

        {isAuthOpen && (
          <div className={`fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 ${darkMode ? 'bg-slate-900/80' : 'bg-slate-900/60'}`}>
            <div className="relative w-full max-w-md animate-scaleIn">
              <AuthPage 
                onLoginSuccess={(role, data) => handleLoginSuccess(role, data)} 
                onClose={() => { setIsAuthOpen(false); setPendingView(null); }} 
              />
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}