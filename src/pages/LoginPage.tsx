import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SamanthaLogo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { companyAuthSchema, type AuthFormValues } from "@/features/dashboard/schemas/auth";
import api from "@/lib/axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(companyAuthSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: AuthFormValues) => {
    try {
      // POST to your Django auth/login/ endpoint
      const response = await api.post("auth/login/", values); 
      const { token } = response.data;

      if (token) {
        localStorage.setItem("auth_token", token);
        toast.success("Access granted. Welcome to Zemuria Engine.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      // Handle Django's non_field_errors or general failures
      const msg = errorData?.non_field_errors?.[0] || "Invalid credentials or unauthorized account.";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-primary">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <SamanthaLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Staff Login</CardTitle>
          <CardDescription>
            Enter your company credentials to access analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control} name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input placeholder="name@yourcompany.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}