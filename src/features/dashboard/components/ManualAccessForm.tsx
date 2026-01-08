import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/axios";
import { toast } from "sonner";

export function ManualAccessForm({ users, plans }: { users: any[], plans: any[] }) {
  const form = useForm({
    defaultValues: {
      user: "", plan: "", gateway: "STRIPE", currency: "USD",
      total_amount: "0.00", tax_amount: "0.00",
      transaction_id: `MAN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
      pg_subscription_id: "MANUAL_BY_ADMIN",
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      auto_renew: false, in_effect: true,
      status: "ACTIVE", payment_status: "SUCCESSFUL"
    }
  });

  async function onSubmit(values: any) {
    try {
      await api.post("/analytics/combined-access/", values);
      toast.success("Success: Access granted, Invoice generated, and Credits synced.");
      form.reset();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Transaction failed.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User & Plan Selection using your value/label pattern */}
            <FormField control={form.control} name="user" render={({ field }) => (
              <FormItem>
                <FormLabel>Target User</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select user..." /></SelectTrigger></FormControl>
                  <SelectContent>{users.map(u => <SelectItem key={u.value} value={u.value.toString()}>{u.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="plan" render={({ field }) => (
              <FormItem>
                <FormLabel>Selected Plan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select plan..." /></SelectTrigger></FormControl>
                  <SelectContent>{plans.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Financial Details */}
            <FormField control={form.control} name="total_amount" render={({ field }) => (
              <FormItem><FormLabel>Total Amount</FormLabel><Input type="number" step="0.01" {...field} /></FormItem>
            )} />

            <FormField control={form.control} name="currency" render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />

            {/* Dates */}
            <FormField control={form.control} name="start_date" render={({ field }) => (
              <FormItem><FormLabel>Start Date</FormLabel><Input type="datetime-local" {...field} /></FormItem>
            )} />
            <FormField control={form.control} name="end_date" render={({ field }) => (
              <FormItem><FormLabel>End Date</FormLabel><Input type="datetime-local" {...field} /></FormItem>
            )} />
          </CardContent>
        </Card>
        
        <div className="flex items-center space-x-2 bg-slate-100 p-4 rounded-lg">
           <FormField control={form.control} name="auto_renew" render={({ field }) => (
             <div className="flex items-center gap-2">
               <Checkbox checked={field.value} onCheckedChange={field.onChange} id="auto_renew" />
               <label htmlFor="auto_renew" className="text-sm font-medium">Enable Auto-Renew</label>
             </div>
           )} />
        </div>

        <Button type="submit" className="w-full h-12 text-lg">Grant Access & Synchronize Credits</Button>
      </form>
    </Form>
  );
}