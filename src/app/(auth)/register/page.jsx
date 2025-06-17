import AuthLayout from "@/app/(auth)/authLayout";
import RegisterForm from "@/components/forms/register-form";
import { Navbar } from "@/components/layout/navbar";
import AppToaster from "@/components/ui/Toaster";
export default function RegisterPage() {
    return (
            <div className="min-h-screen">
            <AppToaster/>
        <Navbar />
        <div className="pt-15 pb-5">
        <AuthLayout>
        <RegisterForm />
        </AuthLayout>
        </div>
        </div>
    );
    }