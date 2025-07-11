import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Users,
  Leaf,
  Fish,
  Building,
  Home,
} from "lucide-react";

interface ProductTabsProps {
  className?: string;
}

const ProductTabs = ({ className = "" }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState("pmi");

  const products = [
    {
      id: "pmi",
      title: "PMI (Pekerja Migran Indonesia)",
      description:
        "Solusi pembiayaan khusus untuk Pekerja Migran Indonesia yang ingin bekerja di luar negeri.",
      features: [
        "Proses pengajuan cepat dan mudah",
        "Suku bunga kompetitif",
        "Pendampingan selama proses penempatan",
        "Perlindungan asuransi selama masa kontrak",
      ],
      icon: <Users className="h-6 w-6" />,
    },
    {
      id: "livestock",
      title: "Peternak",
      description:
        "Pembiayaan untuk pengembangan usaha peternakan dengan skema yang disesuaikan dengan siklus produksi.",
      features: [
        "Pembiayaan modal kerja dan investasi",
        "Pendampingan teknis beternak",
        "Akses ke pasar yang lebih luas",
        "Skema pembayaran yang fleksibel",
      ],
      icon: <Leaf className="h-6 w-6" />,
    },
    {
      id: "farmers",
      title: "Petani/Nelayan",
      description:
        "Dukungan finansial untuk petani dan nelayan dengan mempertimbangkan musim panen dan tangkapan.",
      features: [
        "Pembiayaan alat dan sarana produksi",
        "Skema pembayaran sesuai musim panen",
        "Pendampingan teknis budidaya",
        "Koneksi dengan pembeli hasil panen/tangkapan",
      ],
      icon: <Fish className="h-6 w-6" />,
    },
    {
      id: "umkm",
      title: "UMKM",
      description:
        "Kredit usaha untuk pengembangan Usaha Mikro, Kecil, dan Menengah dengan proses yang sederhana.",
      features: [
        "Modal kerja dan investasi",
        "Bunga rendah sesuai program KUR",
        "Tanpa agunan untuk plafon tertentu",
        "Pendampingan pengembangan usaha",
      ],
      icon: <Building className="h-6 w-6" />,
    },
    {
      id: "housing",
      title: "Kredit Perumahan",
      description:
        "Solusi pembiayaan untuk pembelian, pembangunan, atau renovasi rumah dengan suku bunga bersaing.",
      features: [
        "Tenor panjang hingga 20 tahun",
        "Suku bunga kompetitif",
        "Proses persetujuan cepat",
        "Fleksibilitas dalam pemilihan properti",
      ],
      icon: <Home className="h-6 w-6" />,
    },
  ];

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 py-12 bg-white ${className}`}
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Produk Lendana</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Kami menyediakan berbagai solusi pembiayaan yang disesuaikan dengan
          kebutuhan spesifik setiap sektor
        </p>
      </div>

      <Tabs
        defaultValue="pmi"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8">
          {products.map((product) => (
            <TabsTrigger
              key={product.id}
              value={product.id}
              className="flex items-center gap-2 py-3"
            >
              {product.icon}
              <span className="hidden md:inline">
                {product.title.split(" ")[0]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {products.map((product) => (
          <TabsContent key={product.id} value={product.id} className="mt-4">
            <Card
              className="border-t-4"
              style={{
                borderTopColor:
                  product.id === "pmi"
                    ? "#5680E9"
                    : product.id === "livestock"
                      ? "#84CEEB"
                      : product.id === "farmers"
                        ? "#5AB9EA"
                        : product.id === "umkm"
                          ? "#C1C8E4"
                          : "#8860D0",
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-full"
                    style={{
                      backgroundColor:
                        product.id === "pmi"
                          ? "#5680E9"
                          : product.id === "livestock"
                            ? "#84CEEB"
                            : product.id === "farmers"
                              ? "#5AB9EA"
                              : product.id === "umkm"
                                ? "#C1C8E4"
                                : "#8860D0",
                      color: "#fff",
                    }}
                  >
                    {product.icon}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{product.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {product.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <h4 className="font-semibold text-lg">Keunggulan:</h4>
                  <ul className="grid gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full sm:w-auto"
                  style={{
                    backgroundColor:
                      product.id === "pmi"
                        ? "#5680E9"
                        : product.id === "livestock"
                          ? "#84CEEB"
                          : product.id === "farmers"
                            ? "#5AB9EA"
                            : product.id === "umkm"
                              ? "#C1C8E4"
                              : "#8860D0",
                  }}
                >
                  Ajukan Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProductTabs;
