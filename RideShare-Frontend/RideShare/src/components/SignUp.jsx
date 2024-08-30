import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [phone_no, setPhone_no] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/signup`, { name,email, phone_no ,password });
      localStorage.setItem("token", response.data.token);
      navigate("/");
    } catch (error) {
      console.error("Sign Up failed", error);
    }
  };

  return (
    <div className="h-screen w-screen">
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">Sign Up</h2>
  </div>

  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
            <label htmlFor="name" className="block text-sm font-medium leading-6 text-white">Name</label>
            <div className="mt-2">
            <input 
                id="name" 
                name="name" 
                type="name" 
                autoComplete="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Name"
                className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" 
            />
            </div>
        </div>




      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">Email address</label>
        <div className="mt-2">
          <input 
            id="email" 
            name="email" 
            type="email" 
            autoComplete="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Email"
            className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" 
          />
        </div>
      </div>


      <div>
        <label htmlFor="phone_no" className="block text-sm font-medium leading-6 text-white">Phone Number</label>
        <div className="mt-2">
          <input 
            id="phone_no" 
            name="phone_no" 
            type="phone_no" 
            autoComplete="phone_no" 
            value={phone_no} 
            onChange={(e) => setPhone_no(e.target.value)} 
            required 
            placeholder="Phone Number"
            className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" 
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">Password</label>
          <div className="text-sm">
          </div>
        </div>
        <div className="mt-2">
          <input 
            id="password" 
            name="password" 
            type="password" 
            autoComplete="current-password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            placeholder="Password"
            className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
          />
        </div>
      </div>

      <div>
        <button 
          type="submit" 
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Sign Up
        </button>
      </div>
    </form>

  </div>
</div>
</div>
  );
};

export default SignUp;