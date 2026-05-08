"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "../schema/register-schema";

export function RegisterForm() {
  const { t } = useTranslations();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("登録が完了しました。ログインしてください。");
        router.push("/login");
      } else {
        setError("root", { message: result.error?.message || t("registration.failed") });
      }
    } catch {
      setError("root", { message: t("registration.failed") });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("registration.title")}</CardTitle>
        <CardDescription>{t("registration.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {errors.root.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              ユーザー名
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>
                *
              </span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="表示名を入力してください"
              disabled={isSubmitting}
              aria-required="true"
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {t("login.email")}
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>
                *
              </span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("login.emailPlaceholder")}
              disabled={isSubmitting}
              aria-required="true"
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              パスワード
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>
                *
              </span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上、英字と数字を含む"
              disabled={isSubmitting}
              aria-required="true"
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              パスワード（確認）
              <span className="text-destructive ml-0.5" aria-label={t("accessibility.required")}>
                *
              </span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="パスワードを再入力"
              disabled={isSubmitting}
              aria-required="true"
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録"}
          </Button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {t("registration.termsAgreePrefix")}
            <Link href="/terms" className="text-primary hover:underline">
              {t("registration.termsLink")}
            </Link>
            {t("registration.termsConnector")}
            <Link href="/privacy" className="text-primary hover:underline">
              {t("registration.privacyLink")}
            </Link>
            {t("registration.termsIncludingCookie", { cookie: "" }).split("{cookie}")[0]}
            <Link href="/cookies" className="text-primary hover:underline">
              {t("registration.cookieLink")}
            </Link>
            {t("registration.termsIncludingCookie", { cookie: "" }).split("{cookie}")[1]}
            {t("registration.termsAgreeSuffix")}
          </p>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {t("registration.alreadyHaveAccount")}{" "}
          <Link href="/login" className="text-primary hover:underline">
            {t("common.login")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
