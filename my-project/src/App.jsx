import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import AllLanes from "./pages/allLanes";
import Accounts from './pages/Accounts';
import Edit from "./pages/edit";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

         <Route path="/lanes" element={
          <PrivateRoute>
            <AllLanes/>
          </PrivateRoute>
        } />  

          <Route path="/Accounts" element={
          <PrivateRoute>
            <Accounts/>
          </PrivateRoute>
        } />  


           <Route path="/edit" element={
          <PrivateRoute>
            <Edit/>
          </PrivateRoute>
        } />  

         <Route path="/" element={
          <PrivateRoute>
            <Dashboard/>
          </PrivateRoute>
        } />  

        
      </Routes>
    </Router>
  );
}

export default App;
