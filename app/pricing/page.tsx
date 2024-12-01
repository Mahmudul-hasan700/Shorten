import React from 'react';
import Pricing from '@/components/pricing';

export default function PricingPage() {
    return (
        <main className="w-full mx-auto mt-20 p-5">
            <div className="relative text-center">
                <div className="absolute -left-8 -top-8 h-64 w-64 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
                <div className="absolute -right-8 -top-8 h-64 w-64 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
                <h1 className="relative mb-6 text-4xl font-bold sm:text-6xl lg:text-7xl">
                    Choose Your Plan
                </h1>
                <p className="relative mx-auto mb-8 max-w-2xl text-zinc-400 sm:text-lg">
                    Select the perfect plan for your URL shortening needs. Whether you're an individual or a large enterprise, we have you covered.
                </p>
            </div>
            <Pricing />
            <section className="w-full py-12">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-zinc-400">
                                Have questions about our pricing? We've got answers. If you don't see your question here, feel free to contact us.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-bold">Can I change my plan later?</h3>
                                <p className="text-zinc-400">Yes, you can upgrade or downgrade your plan at any time.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">What payment methods do you accept?</h3>
                                <p className="text-zinc-400">We accept all major credit cards and PayPal.</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Is there a long-term contract?</h3>
                                <p className="text-zinc-400">No, all our plans are billed monthly and you can cancel at any time.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};



