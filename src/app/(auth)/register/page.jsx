import AuthLayout from "@/app/(auth)/authLayout";
import RegisterForm from "@/components/forms/register-form";
import { Navbar } from "@/components/layout/navbar";
export default function RegisterPage() {
    return (
            <div className="min-h-screen">
        <Navbar />
        <div className="pt-15 pb-5">
        <AuthLayout>
        <RegisterForm />
        </AuthLayout>
        </div>
        </div>
    );
    }