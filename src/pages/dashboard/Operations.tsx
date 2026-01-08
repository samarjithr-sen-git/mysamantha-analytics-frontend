import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "@/lib/axios";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function Operations() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [uRes, pRes] = await Promise.all([
          api.get("analytics/options/users"),
          api.get("analytics/options/plans")
        ]);
        setUsers(uRes.data || []);
        setPlans(pRes.data || []);
      } catch (err: any) {
        console.error("Options fetch error:", err);
        toast.error("Failed to load user or plan options");
        setUsers([]);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  const form = useForm({
    defaultValues: { user_id: "", plan_id: "" }
  });

  async function onSubmit(values: any) {
    try {
      await api.post("analytics/admin/user_add", values);
      toast.success("Provisioning Successful!");
      form.reset();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Operation failed";
      toast.error(errorMsg);
      console.error("Provision error:", err);
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight">Manual Provisions</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grant Access</CardTitle>
          <CardDescription>Manually override billing to grant user access.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Email</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map(u => (
                          <SelectItem key={u.id} value={u.id.toString()}>{u.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">Confirm Access Grant</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}