'use client';
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import Link from "next/link";

// Schema using Zod
const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm(
    { resolver: zodResolver(schema) }
  );

  // Check if token exists on component mount
  useEffect(() => {
    if (!token) {
      setTokenError(true);
      setServerMessage("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/users/reset-password", {
        method: "POST",
        body: JSON.stringify({ 
          token: token, 
          password: data.password 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const responseData = await res.text();
      setServerMessage(responseData);

      if (res.ok) {
        toast.success("Password updated successfully!");
        setIsSuccess(true);
        // Redirect to login after successful reset
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(responseData || "Failed to update password.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.");
      setServerMessage("An error occurred. Please try again.");
      setIsSuccess(false);
    }
  };

  // Show error state if no token
  if (tokenError) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-500 rounded-xl mx-auto flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h1>
          <p className="text-gray-600">This password reset link is invalid or has expired.</p>
        </div>
        
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-sm">
          {serverMessage}
        </div>

        <div className="text-center">
          <Link 
            href="/forgot-password" 
            className="inline-block bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Request New Reset Link
          </Link>
        </div>

        <div className="text-center text-sm text-gray-600">
          Remember your password? <Link className="text-teal-600 hover:text-teal-700 font-medium underline" href="/login">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                errors.password ? "border-red-500" : "border-gray-200"
              } text-gray-900 bg-white placeholder-gray-400`}
              placeholder="Enter your new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-200"
              } text-gray-900 bg-white placeholder-gray-400`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Server Message */}
        {serverMessage && !tokenError && (
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
          disabled={isSubmitting || tokenError}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating Password...
            </>
          ) : (
            "Update Password"
          )}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Remember your password? <Link className="text-teal-600 hover:text-teal-700 font-medium underline" href="/login">Sign in</Link>
      </div>
    </form>
  );
}
