"use client";

import { RevealOnScroll } from "@/components/animations/reveal-on-scroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageCircle, MapPin } from "lucide-react";

interface ContactDictionary {
    title: string;
    subtitle: string;
    description: string;
    info: {
        email: string;
        whatsapp: string;
        location: string;
    };
    form: {
        title: string;
        name: string;
        email: string;
        message: string;
        placeholderName: string;
        placeholderEmail: string;
        placeholderMessage: string;
        submit: string;
    };
}

interface ContactPageProps {
    dict: ContactDictionary;
}

export function ContactPage({ dict }: ContactPageProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for form submission logic
        alert("Thank you! We will get back to you soon.");
    };

    return (
        <main className="min-h-screen bg-slate-50 pt-40 pb-24">
            <div className="container mx-auto px-4 md:px-6">

                <div className="grid lg:grid-cols-2 gap-20">

                    {/* Left: Info */}
                    <div>
                        <RevealOnScroll>
                            <h1 className="font-heading text-5xl md:text-7xl font-bold text-slate-900 mb-8">
                                {dict.title} <span className="text-primary">{dict.subtitle}</span>
                            </h1>
                            <p className="text-xl text-slate-500 mb-12 max-w-md">
                                {dict.description}
                            </p>
                        </RevealOnScroll>

                        <div className="space-y-8">
                            <RevealOnScroll delay={0.1} className="flex items-start gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">{dict.info.email}</h4>
                                    <p className="text-slate-500">mariomolla@outlook.com</p>
                                </div>
                            </RevealOnScroll>

                            <RevealOnScroll delay={0.2} className="flex items-start gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">{dict.info.whatsapp}</h4>
                                    <p className="text-slate-500">+355 68 202 2686</p>
                                </div>
                            </RevealOnScroll>

                            <RevealOnScroll delay={0.3} className="flex items-start gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">{dict.info.location}</h4>
                                    <p className="text-slate-500">Koman Terminal, Shkoder, Albania</p>
                                </div>
                            </RevealOnScroll>
                        </div>
                    </div>

                    {/* Right: Simple Form */}
                    <RevealOnScroll direction="left" delay={0.2}>
                        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 font-heading">{dict.form.title}</h3>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">{dict.form.name}</label>
                                        <Input placeholder={dict.form.placeholderName} className="bg-slate-50 border-0 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">{dict.form.email}</label>
                                        <Input placeholder={dict.form.placeholderEmail} className="bg-slate-50 border-0 h-12" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">{dict.form.message}</label>
                                    <Textarea placeholder={dict.form.placeholderMessage} className="bg-slate-50 border-0 min-h-[150px]" />
                                </div>
                                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20">
                                    {dict.form.submit}
                                </Button>
                            </form>
                        </div>
                    </RevealOnScroll>

                </div>
            </div>
        </main>
    );
}
