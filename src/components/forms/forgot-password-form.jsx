'use client';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

// Schema using Zod
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPasswordForm() {
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm(
    { resolver: zodResolver(schema) }
  );

  const onSubmit = async (data) => {
    try {
      setServerMessage("");
      setIsSuccess(false);

      const res = await fetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      const responseText = await res.text();
      setServerMessage(responseText);

      if (res.ok) {
        toast.success("Reset link sent successfully!");
        setIsSuccess(true);
        reset(); // Clear the form on success
      } else {
        toast.error(responseText || "Failed to send reset link.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage = "An error occurred. Please try again.";
      toast.error(errorMessage);
      setServerMessage(errorMessage);
      setIsSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
        <p className="text-gray-600">Enter your email to receive a reset link</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            {...register("email")}
            type="email"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? "border-red-500" : "border-gray-200"
            } text-gray-900 bg-white placeholder-gray-400`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
        </div>

        {/* Server Message */}
        {serverMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            isSuccess 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {serverMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Reset Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </button>

        {/* Success state - show additional info */}
        {isSuccess && (
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-medium text-blue-800 mb-1">Check your email!</p>
            <p>If an account with that email exists, we've sent you a password reset link. The link will expire in 30 minutes.</p>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-gray-600">
        Remember your password? <Link className="text-teal-600 hover:text-teal-700 font-medium underline" href="/login">Sign in</Link>
      </div>
    </form>
  );
}
