import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from "./Components/LoginSignup/Signup";
import Login from "./Components/LoginSignup/Login";
import Home from './Components/Home/Home';
import Reviews from './Components/Home/Reviews';
import AboutUs from './Components/AboutContact/AboutUs';
import Account from './Components/Account/Account';
import ForgotPassword from './Components/LoginSignup/ForgotPassword';
import ResetPassword from './Components/LoginSignup/ResetPassword';
import Course from './Components/Course/Course';
import SubjectDetail from './Components/Course/SubjectDetail'; 
import Materials from './Components/Materials/Materials';
import MaterialDetails from './Components/Materials/MaterialDetails';
import VerifyEmail from './Components/LoginSignup/VerifyEmail';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/Reviews" element={<Reviews />} />
                <Route path="/AboutUs" element={<AboutUs />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/Course" element={<Course />} />
                <Route path="/Subject/:subjectName" element={<SubjectDetail />} />
                <Route path="/Materials" element={<Materials />} />
                <Route path="/material/:materialId" element={<MaterialDetails />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
        </Router>
    );
}

export default App;