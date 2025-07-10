import React from 'react'
import CustomLogin from '../components/Auth/CustomLogin'
import GoogleAuth from '../components/Auth/GoogleAuth'
import '../styles/Login.css'


const Login = () => {
  return (
    <div className='login-container' >
        <h1>Login</h1>
        <div className="form-container">
          <CustomLogin/>
          <p>or</p>
          <GoogleAuth />
        </div>
    </div>
  )
}

export default Login