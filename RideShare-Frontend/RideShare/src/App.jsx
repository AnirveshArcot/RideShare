import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/NavBar';
import CreateRide from './components/CreateRide';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<><Navbar /><Home /></>} />
                    <Route path="/createride" element={<CreateRide />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
