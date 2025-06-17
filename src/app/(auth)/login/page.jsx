import AuthLayout from "@/app/(auth)/authLayout";
import LoginForm from "@/components/forms/login-form";
import { Navbar } from "@/components/layout/navbar";
import AppToaster from "@/components/ui/Toaster";
export default function LoginPage() {
    return (
            <div className="min-h-screen">

            <AppToaster />
            <Navbar />
                  <div className="pt-15 pb-5">
            <AuthLayout>
                <LoginForm />
            </AuthLayout>
        </div>
        </div>
    );
}