"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Clock } from "lucide-react";

import { contactSchema, ContactFormValues } from "@/lib/schemas/contact";

const contactInfo = [
  {
    icon: Phone,
    title: "Call Us",
    text: "+(03) 255 201 888",
  },
  {
    icon: Mail,
    title: "Email Now",
    text: "Hello@procleaning.com",
  },
  {
    icon: Clock,
    title: "Hours",
    text: "Mon–Friday 10:00AM – 7:00PM",
  },
];

type ContactSectionProps = {
  showWatermark?: boolean;
};

export default function ContactSection({
  showWatermark = false,
}: ContactSectionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setStatus("submitting");

    try {
      const res = await fetch("https://formspree.io/f/mnnevkyj", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        reset();
        router.push("/contact/success");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    } finally {
      setStatus((prev) => (prev === "submitting" ? "idle" : prev));
    }
  }

  return (
    <section className="overflow-hidden bg-white py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Two-column layout */}
        <div className="grid gap-16 lg:grid-cols-2">
          {/* LEFT: info cards */}
          <div className="flex h-full flex-col justify-between space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="mb-2 text-4xl font-bold text-slate-900 lg:text-5xl">
                Get in touch
              </h2>
            </div>

            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="flex h-20 items-center gap-5 rounded-lg border border-[#F3F3F3] bg-[#FBFBFB] px-4"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #367D5E 0%, #479670 50%, #7ABF9D 100%)",
                    }}
                  >
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center lg:text-left">
              <p className="mb-4 text-sm text-gray-600 lg:text-lg">
                Want to book a pick up? Please get an estimate first.
              </p>
              <Link href="/booking">
                <Button className="h-auto bg-brand px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-[#367D5E]">
                  Get an Estimate
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: form */}
          <div className="relative">
            {showWatermark && (
              <span className="hidden lg:block pointer-events-none absolute -top-20 left-0 select-none text-[100px] font-bold leading-none text-[#479670]/10 md:-top-24 md:text-[130px]">
                CONTACT
              </span>
            )}

            <div className="relative z-10">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="mb-2 text-4xl font-bold text-slate-900 lg:text-5xl">
                  Talk to us
                </h2>
                <p className="mx-auto max-w-lg text-sm text-gray-500 lg:mx-0 lg:text-lg">
                  We prioritize responding to your inquiries promptly to ensure
                  you receive the assistance you need in a timely manner
                </p>
              </div>

              {status === "error" && (
                <p className="mb-4 text-xs text-red-500">
                  Something went wrong sending your message. Please try again or
                  email us directly.
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Name"
                    {...register("name")}
                    className={`border-gray-200 bg-white py-6 ${
                      errors.name
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                    className={`border-gray-200 bg-white py-6 ${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="message"
                    className="text-sm font-semibold text-slate-900"
                  >
                    Message <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Message"
                    {...register("message")}
                    className={`min-h-[120px] border-gray-200 bg-white ${
                      errors.message
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 flex h-auto w-full max-w-40 items-center justify-center mx-auto lg:mx-0 border border-brand bg-white px-8 py-3 text-base font-medium text-brand hover:bg-gray-50 disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending..." : "Submit"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
