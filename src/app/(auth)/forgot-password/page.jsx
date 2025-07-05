import AuthLayout from "@/app/(auth)/authLayout";
import ForgotPasswordForm from "@/components/forms/forgot-password-form";
import { Navbar } from "@/components/layout/navbar";
export default function LoginPage() {
    return (
            <div className="min-h-screen">

            <Navbar />
                  <div className="pt-15 pb-5">
            <AuthLayout>
                <ForgotPasswordForm />
            </AuthLayout>
        </div>
        </div>
    );
}