import AuthLayout from "@/app/(auth)/authLayout";
import LoginForm from "@/components/features/auth/login-form";
import { Navbar } from "@/components/layout/navbar";
import AppToaster from "@/components/ui/Toaster";
export default function LoginPage() {
    return (
        <div>
        <AppToaster />
        <Navbar/>
        <AuthLayout>
        <LoginForm />
        </AuthLayout>
        </div>
    );
    }