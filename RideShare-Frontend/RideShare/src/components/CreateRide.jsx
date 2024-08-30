import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

const CreateRide = () => {
  const [destination, setDestination] = useState("");
  const [pickup, setPickup] = useState("");
  const [time, setTime] = useState("10:00");
  const [phoneNo, setPhoneNo] = useState("");
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  function convertTimeToDateTime(timeString) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const [hours, minutes] = timeString.split(':');
    const combinedDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
    const timezoneOffset = now.getTimezoneOffset() / 60;
    const sign = timezoneOffset > 0 ? '-' : '+';
    const offsetHours = String(Math.floor(Math.abs(timezoneOffset))).padStart(2, '0');
    const offsetMinutes = String(Math.abs(timezoneOffset) % 1 * 60).padStart(2, '0');
    const timezone = `${sign}${offsetHours}:${offsetMinutes}`;
    const formattedDate = `${combinedDate.toISOString().split('.')[0]}${timezone}`;
    return formattedDate;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded.name);
        setPhoneNo(decoded.phone_no);
        setEmail(decoded.email);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);


  const handleTimeChange = (event) => {
    setTime(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/rides`, { host:user, destination, pickup, time:convertTimeToDateTime(time), phone_no: phoneNo , email });
      toast.success("Ride posted successfully!"); // Success toast
      navigate("/");
    } catch (error) {
      toast.error("Failed to post ride. Please try again."); // Error toast
      console.error("Ride post failed", error);
    }
  };

  return (
    <div className="h-screen w-screen">
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">Post a Ride</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium leading-6 text-white">Destination</label>
              <div className="mt-2">
                <input 
                  id="destination" 
                  name="destination" 
                  type="text" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value)} 
                  required 
                  placeholder="  Destination"
                  className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="pickup" className="block text-sm font-medium leading-6 text-white">Pickup Location</label>
              <div className="mt-2">
                <input 
                  id="pickup" 
                  name="pickup" 
                  type="text" 
                  value={pickup} 
                  onChange={(e) => setPickup(e.target.value)} 
                  required 
                  placeholder="  Pickup Location"
                  className="block w-full rounded-md border-0 py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6" 
                />
              </div>
            </div>

            <div>
                <label htmlFor="time" className="block text-sm font-medium leading-6 text-white">
                    Time
                </label>
                <div className="mt-2">
                    <form className="max-w-[8rem] mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
                        </svg>
                        </div>
                        <input
                        type="time"
                        id="time"
                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        min="09:00"
                        max="18:00"
                        value={time}
                        onChange={handleTimeChange}
                        required
                        />
                    </div>
                    </form>
                </div>
            </div>

            <div className="flex space-x-4">
              <button 
                type="submit" 
                className="flex w-1/2 justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Post Ride
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateRide;
