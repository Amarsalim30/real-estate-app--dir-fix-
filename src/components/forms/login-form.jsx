'use client';
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2Icon } from "lucide-react";


// Schema using Zod
const schema = z.object({
  identifier: z.string().refine(val => {
    return val.includes('@') ? z.string().email().safeParse(val).success : val.length >= 3;
  }, {
    message: "Enter a valid email or username"
  }), password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
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
    const res = await signIn("credentials", {
      redirect: false,
      ...data
    });

    setServerError("");

    // Redirect or set auth state here
    if (res?.ok) {
      toast.success("Login successful!");
      router.push("/dashboard");
    } else {
      toast.error("Invalid email or password.");
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your Estate Dashboard</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-1">Email or Username</div>
          <input
            {...register("identifier")}
            type="text"
            className={`w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${errors.identifier ? "border-red-500" : "border-gray-200"} text-gray-900 bg-white placeholder-gray-400`}
            placeholder="Enter your email or username"
          />
          {errors.identifier && <p className="text-red-600 text-sm mt-1">{errors.identifier.message}</p>}
        </div>

 <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      {...register("password")}
      className={`w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
        errors.password ? "border-red-500" : "border-gray-200"
      } text-gray-900 bg-white placeholder-gray-400`}
      placeholder="Enter your password"
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


        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <input type="checkbox"
              // {...register("remember")}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
            <span className="ml-2 text-gray-600">Remember me</span>
          </div>
          <Link href={"/forgot-password"} className="text-teal-600 hover:text-teal-700 font-medium">Forgot password?</Link>
        </div>

        {/* Error Alert */}
        {serverError && <p className="text-red-600 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isSubmitting ? " Signing in...": "Sign In"}
        </button>
      </div>

      <div className="text-center text-sm text-gray-600">
        Don't have an account? <Link className="text-teal-600 hover:text-teal-700 font-medium underline" href={"/register"} >Sign up</Link>
      </div>
    </form>
  );
}
