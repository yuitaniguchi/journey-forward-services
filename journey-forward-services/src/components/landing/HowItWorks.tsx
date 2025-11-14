// This data array makes the component clean and easy to update.
const steps = [
  {
    title: 'Send a Request for Estimate',
    description:
      'Select items and fill in your info to get a detailed estimate.',
    image: '/placeholder-image-1.jpg', // Replace with your actual image path
  },
  {
    title: 'Review & Confirm a Pickup',
    description:
      'After you get a detailed estimate by email or text, you can confirm your booking.',
    image: '/placeholder-image-2.jpg', // Replace with your actual image path
  },
  {
    title: 'Pick up, Deliver or Donate',
    description: 'Your items are either delivered or donated.',
    image: '/placeholder-image-3.jpg', // Replace with your actual image path
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 container">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-dark mb-2">
            Need a hand? <br /> We've got you covered.
          </h2>
        </div>
        <div className="max-w-sm">
          <h3 className="font-bold text-lg text-brand-dark mb-2">
            How it works
          </h3>
          <p className="text-sm text-gray-500">
            While we can customize your plan to suit your needs, most clients
            schedule Pick-up services.
          </p>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div key={step.title} className="space-y-4 group">
            {/* Image Placeholder */}
            {/* Replace this div with your <Image> component */}
            <div className="aspect-[4/3] bg-brand-gray rounded-xl w-full overflow-hidden transition-transform duration-300 group-hover:scale-105">
              {/* <Image src={step.image} alt={step.title} layout="fill" objectFit="cover" /> */}
              <div className="flex items-center justify-center h-full text-gray-400">
                [Image]
              </div>
            </div>
            <h3 className="font-bold text-lg text-brand-dark">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
