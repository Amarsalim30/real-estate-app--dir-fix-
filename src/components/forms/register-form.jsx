'use client';
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import React from 'react';
import Link from "next/link";

// Schema using Zod
const schema = z
    .object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Enter a valid email"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters")
    })
    .refine((data) => 
      data.password === data.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match"

      });
       

// Demo content for preview
export default function RegisterForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm(
    { resolver: zodResolver(schema) }
  );

  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    setServerError("");

    try {
      // Simulate login API
      toast.success(res.message, res.data);
      console.log("User Registered:", data);

      // Redirect or set auth state here
      router.push('/dashboard')
    } catch (err) {
      // Handle failed login
      toast.error("Failed to create account.");
      setServerError("Invalid email or password.");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600">Join the Estate Dashboard</p>
      </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">First Name</div>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200  text-gray-900 bg-white placeholder-gray-400  ${errors.firstName ? "border-red-500" : "border-gray-200"}`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
          <div>
            <div className="block text-sm font-medium text-gray-700 mb-1">Last Name</div>
            <input
              type="text"
              {...register("lastName")}
              className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200  text-gray-900 bg-white placeholder-gray-400 ${errors.lastName ? "border-red-500" : "border-gray-200"}`}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
          </div>
        </div>
        </div>

        <div>
          <div className="block text-sm font-medium text-gray-700 mb-1">Email</div>
          <input
            type="email"
            {...register("email")}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200  text-gray-900 bg-white placeholder-gray-400 ${errors.email ? "border-red-500" : "border-gray-200"}`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <div className="block text-sm font-medium text-gray-700 mb-1">Password</div>
          <input
            type="password"
            {...register("password")}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200  text-gray-900 bg-white placeholder-gray-400 ${errors.password ? "border-red-500" : "border-gray-200"}`}
            placeholder="Create a strong password"
          />
          {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <div className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</div>
          <input
            type="password"
            {...register("confirmPassword")}
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200  text-gray-900 bg-white placeholder-gray-400 ${errors.confirmPassword ? "border-red-500" : "border-gray-200"}`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start text-sm">
          <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1" />
          <span className="ml-2 text-gray-600">I agree to the <button className="text-teal-600 hover:text-teal-700 font-medium">Terms of Service</button> and <button className="text-teal-600 hover:text-teal-700 font-medium">Privacy Policy</button></span>
        </div>

        <button
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Already have an account? <Link href={"/login"} className="text-teal-600 hover:text-teal-700 font-medium underline">Sign in</Link>
        </div>
    </form>
  );
}