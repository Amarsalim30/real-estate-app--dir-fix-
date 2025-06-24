import AuthLayout from "@/app/(auth)/authLayout";
import ResetPasswordForm from "@/components/forms/reset-password-form";
import { Navbar } from "@/components/layout/navbar";
export default function LoginPage() {
    return (
            <div className="min-h-screen">

            <Navbar />
                  <div className="pt-15 pb-5">
            <AuthLayout>
                <ResetPasswordForm />
            </AuthLayout>
        </div>
        </div>
    );
}