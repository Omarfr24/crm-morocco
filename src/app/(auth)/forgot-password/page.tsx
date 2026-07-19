import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Please contact the system administrator to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground text-center">
          Self-service password reset will be available once email
          notifications are configured.
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Back to Sign In
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
