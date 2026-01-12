import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  manualOpSchema,
  type ManualOpValues,
} from "@/features/dashboard/schemas/manual-op-schema";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Loader2,
  History,
  Check,
  ChevronsUpDown,
  ShieldAlert,
  Landmark,
  RefreshCw,
  Power,
  Activity,
  CalendarDays,
} from "lucide-react";

// Generate unique IDs
// const generateTransactionId = () =>
//   `MAN-${Date.now()}-${Math.random()
//     .toString(36)
//     .substring(2, 8)
//     .toUpperCase()}`;
// const generateSubscriptionId = () =>
//   `SUB-${Date.now()}-${Math.random()
//     .toString(36)
//     .substring(2, 8)
//     .toUpperCase()}`;

export default function Operations() {
  const queryClient = useQueryClient();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ["user-options"],
    queryFn: () => api.get("analytics/options/users/").then((res) => res.data),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plan-options"],
    queryFn: () => api.get("analytics/options/plans/").then((res) => res.data),
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ["manual-logs"],
    queryFn: () => api.get("analytics/admin/logs/").then((res) => res.data),
  });

  const { control, handleSubmit, reset, setValue } = useForm<ManualOpValues>({
    resolver: zodResolver(manualOpSchema) as any,
    defaultValues: {
      user: "",
      plan: "",
      gateway: "STRIPE",
      currency: "USD",
      total_amount: 0,
      tax_amount: 0,
      auto_renew: false,
      in_effect: true,
      transaction_id: "",
      pg_subscription_id: "",
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
      status: "ACTIVE",
      payment_status: "SUCCESSFUL",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ManualOpValues) =>
      api.post("analytics/admin/user_add/", values),
    onSuccess: (res) => {
      toast.success(res.data.message || "Manual Override Successful!");
      reset({
        user: "",
        plan: "",
        gateway: "STRIPE",
        currency: "USD",
        total_amount: 0,
        tax_amount: 0,
        auto_renew: false,
        in_effect: true,
        transaction_id: "",
        pg_subscription_id: "",
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 30 * 86400000)
          .toISOString()
          .slice(0, 16),
        status: "ACTIVE",
        payment_status: "SUCCESSFUL",
      });
      queryClient.invalidateQueries({ queryKey: ["manual-logs"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Transaction Failed");
    },
  });

  return (
    <div className="container mx-auto py-10 space-y-10 max-w-7xl">
      <header className="flex flex-col gap-2 border-b pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 rounded-xl">
            <ShieldAlert className="h-7 w-7 text-rose-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Manual Operations
            </h1>
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-3 w-3" /> System Level Overrides
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <Card className="border shadow-2xl">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-xl font-bold">
                Provisioning Terminal
              </CardTitle>
              <CardDescription>
                Directly modify user records. Updates Payments, Plans, and
                Credits atomically.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form
                onSubmit={handleSubmit((data) => mutation.mutate(data))}
                className="space-y-8"
              >
                {/* User & Plan Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="font-bold">Target User</Label>
                    <Controller
                      name="user"
                      control={control}
                      render={({ field }) => (
                        <Popover
                          open={userDropdownOpen}
                          onOpenChange={setUserDropdownOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between h-12",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? users.find(
                                    (u: any) =>
                                      u.value.toString() === field.value
                                  )?.label
                                : "Select User..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[400px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput placeholder="Search users..." />
                              <CommandList>
                                <CommandEmpty>
                                  No matching user found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {users.map((u: any) => (
                                    <CommandItem
                                      key={u.value}
                                      onSelect={() => {
                                        setValue("user", u.value.toString());
                                        setUserDropdownOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          u.value.toString() === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {u.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold">Plan Selection</Label>
                    <Controller
                      name="plan"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Choose plan" />
                          </SelectTrigger>
                          <SelectContent>
                            {plans.map((p: any) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Gateway & IDs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-blue-600">
                      Payment Gateway
                    </Label>
                    <Controller
                      name="gateway"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-10 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STRIPE">Stripe</SelectItem>
                            <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                            <SelectItem value="GOOGLE">Google Play</SelectItem>
                            <SelectItem value="APPLE">
                              Apple App Store
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-blue-600">
                      Transaction ID
                    </Label>
                    <Controller
                      name="transaction_id"
                      control={control}
                      render={({ field }) => (
                        <Input
                          className="h-10 bg-white font-mono text-xs"
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-blue-600">
                      Subscription ID
                    </Label>
                    <Controller
                      name="pg_subscription_id"
                      control={control}
                      render={({ field }) => (
                        <Input
                          className="h-10 bg-white font-mono text-xs"
                          {...field}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-slate-500">
                      Price Paid
                    </Label>
                    <Controller
                      name="total_amount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="h-10 bg-white"
                          value={field.value || ""}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? 0
                                : parseFloat(e.target.value)
                            )
                          }
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-slate-500">
                      Currency
                    </Label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="h-10 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> Effective Start
                    </Label>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="datetime-local"
                          {...field}
                          className="h-11"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" /> Expiration Date
                    </Label>
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="datetime-local"
                          {...field}
                          className="h-11"
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-100 rounded-xl border border-dashed border-slate-300">
                  <div className="flex items-center space-x-3 px-2">
                    <Controller
                      name="auto_renew"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="auto_renew"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label
                      htmlFor="auto_renew"
                      className="text-sm font-bold flex items-center gap-2"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-blue-600" />{" "}
                      Auto-Renew
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 px-2">
                    <Controller
                      name="in_effect"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="in_effect"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <label
                      htmlFor="in_effect"
                      className="text-sm font-bold flex items-center gap-2"
                    >
                      <Power className="h-3.5 w-3.5 text-emerald-600" /> Plan
                      In-Effect
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-xl font-bold bg-slate-900 hover:bg-black shadow-xl"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="animate-spin mr-2 h-6 w-6" />
                  ) : (
                    <Landmark className="mr-2 h-6 w-6" />
                  )}
                  Commit Manual Override
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recent Logs */}
        <div className="lg:col-span-4">
          <Card className="h-full border-none shadow-2xl flex flex-col max-h-[850px] overflow-hidden">
            <CardHeader className="bg-slate-900 text-white pb-2 rounded-t-xl">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-rose-400" />
                <CardTitle>Recent History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {recentLogs.length > 0 ? (
                recentLogs.map((log: any) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-slate-50 space-y-1"
                  >
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                    <p className="text-sm font-semibold text-slate-700 leading-tight">
                      {log.action_details}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-300 py-20 font-medium italic">
                  No logs yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
