import React, { useEffect, useRef, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '@/redux/authSlice';
import GoogleButton from './GoogleButton';

import BIRDS from "vanta/dist/vanta.birds.min";
import * as THREE from "three";

const Login = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/v1/user/login', input, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (res.data.success) {
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({ email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // redirect if already logged in
  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // ✅ Vanta background
  useEffect(() => {
    if (!vantaEffect.current && vantaRef.current) {
      vantaEffect.current = BIRDS({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        backgroundColor: 0x0f172a, // optional
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* ✅ Background */}
      <div ref={vantaRef} className="absolute inset-0 -z-10" />

      {/* ✅ Foreground */}
      <div className='flex items-center w-full h-full justify-center'>
        <form onSubmit={loginHandler} className='w-[360px] p-8 flex flex-col gap-5
  rounded-2xl
  bg-white/5
  backdrop-blur-md
  border border-white/20
  shadow-2xl '>
          <div className='my-2'>
            <h1 className='text-center font-bold text-xl text-white'>SnapSphere</h1>
            <p className='text-sm text-center text-white'>Login to see photos & videos from your friends</p>
          </div>

          <GoogleButton text="Continue with Google" />

          <div className="flex items-center gap-3">
            <div className="h-[1px] bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 text-white">OR</span>
            <div className="h-[1px] bg-gray-200 flex-1" />
          </div>

          <div>
            <span className='font-medium text-white'>Email</span>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>

          <div>
            <span className='font-medium text-white'>Password</span>
            <Input
              type="password"
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              className="focus-visible:ring-transparent my-2"
            />
          </div>

          {loading ? (
            <Button disabled>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Please wait
            </Button>
          ) : (
            <Button type='submit'>Login</Button>
          )}

          <span className='text-center text-white'>
            Doesn&apos;t have an account? <Link to="/signup" className='text-blue-600'>Signup</Link>
          </span>
        </form>
      </div>
    </div>
  )
}

export default Login;
