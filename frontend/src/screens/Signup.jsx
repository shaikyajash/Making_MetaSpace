import React from "react";
import CustomSignup from "../components/Auth/CustomSignup";
import GoogleAuth from "../components/Auth/GoogleAuth";
import "../styles/Signup.css";


const Signup = () => {
  return (
    <div className="signup-container">
      <h1>Signup</h1>
      <div className="form-container">
        <CustomSignup />
        <p>or</p>
        <GoogleAuth />
      </div>
    </div>
  );
};

export default Signup;