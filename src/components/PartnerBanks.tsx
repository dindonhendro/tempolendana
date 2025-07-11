import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PartnerBank {
  name: string;
  logo: string;
  description: string;
}

interface PartnerBanksProps {
  banks?: PartnerBank[];
}

const PartnerBanks = ({ banks = defaultBanks }: PartnerBanksProps) => {
  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Our Partner Banks
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Lendana works with trusted financial institutions to provide you with
          the best financial services and KUR (People's Business Credit)
          channeling options.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {banks.map((bank, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-32 mb-4">
                  <img
                    src={bank.logo}
                    alt={`${bank.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">
                  {bank.name}
                </h3>
                <p className="text-gray-600 text-center">{bank.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const defaultBanks: PartnerBank[] = [
  {
    name: "Bank BNI",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80",
    description:
      "Partnering with BNI to provide accessible financial solutions for all Indonesians.",
  },
  {
    name: "Bank Mandiri",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80",
    description:
      "Working with Mandiri to support Indonesian Migrant Workers and SMEs.",
  },
  {
    name: "Bank BRI",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80",
    description:
      "Collaborating with BRI to provide KUR financing for farmers and fishermen.",
  },
  {
    name: "Bank BTN",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80",
    description:
      "Partnering with BTN to offer housing credit solutions for all Indonesians.",
  },
  {
    name: "Bank Nano",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80",
    description:
      "Leveraging digital banking with Bank Nano for faster financial access.",
  },
  {
    name: "BPR Network",
    logo: "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80",
    description:
      "Working with multiple BPR banks to serve local communities across Indonesia.",
  },
];

export default PartnerBanks;
