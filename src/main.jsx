import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// import Admin from './Admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* <Admin /> */}
  </StrictMode>,
)

// import React, { useState } from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'         // Customer Exchange Page
// import AdminDashboard from './Admin.jsx' // Admin Dashboard Page
// import AuthPage from './Auth.jsx'   // Login & Register Page
// import './App.css'

// function Root() {
//   const [userRole, setUserRole] = useState('guest');

//   const handleLoginSuccess = (role) => {
//     setUserRole(role);
//   };

//   // Condition Page Logic
//   if (userRole === 'admin') {
//     return <AdminDashboard />;
//   }

//   if (userRole === 'user') {
//     return <App />;
//   }

//   // AuthPage (Login/Register) 
//   return <AuthPage onLoginSuccess={handleLoginSuccess} />;
// }

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Root />
//   </React.StrictMode>,
// )