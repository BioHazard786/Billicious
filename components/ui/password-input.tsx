import { Check, EyeIcon, EyeOffIcon, X } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Box } from "@/components/ui/box";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppleDevice } from "@/hooks/use-apple-device";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createElement, useMemo, useState } from "react";
import { Progress } from "./progress";

type PasswordFieldProps = {
  name?: string;
  placeholder?: string;
  description?: string | JSX.Element;
};

export function PasswordField({
  name = "password",
  placeholder = "••••••••",
  description,
}: PasswordFieldProps) {
  const isApple = useAppleDevice().isAppleDevice;
  const { control, getFieldState } = useFormContext();
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            <span className="flex justify-between">
              Password
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground"
              >
                Forgot password?
              </Link>
            </span>
          </FormLabel>
          <FormControl>
            <Box className="relative">
              <Input
                {...field}
                type={passwordVisibility ? "text" : "password"}
                autoComplete="on"
                placeholder={placeholder}
                className={cn(
                  "pr-12",
                  `${getFieldState(name).error && "text-destructive"}`,
                  isApple ? "text-base" : "",
                )}
              />
              <Box
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                onClick={() => setPasswordVisibility(!passwordVisibility)}
              >
                {createElement(passwordVisibility ? EyeOffIcon : EyeIcon, {
                  className: "size-5",
                })}
              </Box>
            </Box>
          </FormControl>
          <FormMessage />
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
}

export function PasswordStrengthField({
  name = "password",
  placeholder = "••••••••",
  description,
}: PasswordFieldProps) {
  const isApple = useAppleDevice().isAppleDevice;
  const { control, getFieldState } = useFormContext();
  const [passwordVisibility, setPasswordVisibility] = useState(false);

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const strength = checkStrength(field.value);
        const strengthScore = useMemo(() => {
          return strength.filter((req) => req.met).length;
        }, [strength]);
        return (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Box className="relative">
                <Input
                  {...field}
                  type={passwordVisibility ? "text" : "password"}
                  autoComplete="on"
                  placeholder={placeholder}
                  className={cn(
                    "pr-12",
                    `${getFieldState(name).error && "text-destructive"}`,
                    isApple ? "text-base" : "",
                  )}
                />
                <Box
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                  onClick={() => setPasswordVisibility(!passwordVisibility)}
                >
                  {createElement(passwordVisibility ? EyeOffIcon : EyeIcon, {
                    className:
                      "size-4 hover:text-foreground text-muted-foreground transition",
                  })}
                </Box>
              </Box>
            </FormControl>
            <FormMessage />
            {description && <FormDescription>{description}</FormDescription>}
            {/* Password strength indicator */}
            <Progress
              value={(strengthScore / 4) * 100}
              className="h-1 bg-border"
              progressBar={getStrengthColor(strengthScore)}
            />

            {/* Password requirements list */}
            <ul className="space-y-1.5" aria-label="Password requirements">
              {strength.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  {req.met ? (
                    <Check
                      size={16}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <X
                      size={16}
                      className="text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`text-xs ${req.met ? "text-emerald-500" : "text-muted-foreground"}`}
                  >
                    {req.text}
                    <span className="sr-only">
                      {req.met
                        ? " - Requirement met"
                        : " - Requirement not met"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </FormItem>
        );
      }}
    />
  );
}
