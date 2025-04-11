import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { loginService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useLocalStorage<
    Array<{ email: string; password: string }>
  >("trip-harmonizer-users", []);
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>(
    "trip-harmonizer-current-user",
    null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setLoading(true);
    loginService({ email: data.email, password: data.password })
      .then((res) => {
        console.log(res);
        localStorage.setItem("trip-harmonizer-current-user-token", res.token);
        login(res.user.email, res.user.name);
        toast({
          title: "Login successful",
          description: "Welcome back to TripHarmonizer!",
        });
        setLoading(false);
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        throw err;
      });
    // Simulate API call with timeout
    // setTimeout(() => {
    //   const userExists = users.find(
    //     (u) => u.email === data.email && u.password === data.password
    //   );

    //   if (userExists) {
    //     setCurrentUser(data.email);
    //     toast({
    //       title: "Login successful",
    //       description: "Welcome back to TripHarmonizer!",
    //     });
    //     navigate("/");
    //   } else {
    //     toast({
    //       variant: "destructive",
    //       title: "Login failed",
    //       description: "Invalid email or password. Please try again.",
    //     });
    //   }

    //   setLoading(false);
    // }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/50">
      <div className="max-w-md w-full mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">TripHarmonizer</h1>
        <p className="text-muted-foreground">
          Split expenses with friends and family with ease.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center w-full">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
