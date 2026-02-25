import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";
import { Tag, MapPin, Package } from "lucide-react";
import { PrecosEntregaTab } from "./precos/entrega-tab";
import { ProdutosTab } from "./precos/produtos-tab";

export default function PrecosView() {
  const [activeTab, setActiveTab] = useState("entregas");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] rounded-xl">
              <Tag className="w-8 h-8 text-white" />
            </div>
            Tabelas de Preços
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie preços de entregas e produtos
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="entregas">
            <MapPin className="w-4 h-4 mr-2" />
            Preços de Entrega
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Package className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entregas" className="space-y-4">
          <PrecosEntregaTab />
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <ProdutosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
