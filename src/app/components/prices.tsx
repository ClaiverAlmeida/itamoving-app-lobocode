import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";
import { Tag, MapPin, Package } from "lucide-react";
import { useData } from "../context/DataContext";
import { DeliveryPricesTab } from "./prices/delivery-prices";
import { ProductsPricesTab } from "./prices/products-prices";

export default function PrecosView() {
  const { setPrecosEntrega, deletePrecoEntrega, setPrecosProdutos, deletePrecoProduto } = useData();
  const [activeTab, setActiveTab] = useState("entregas");

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl lg:text-3xl font-bold">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-[#1E3A5F] to-[#5DADE2] rounded-xl">
              <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            Tabelas de Preços
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
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
        <TabsList className="grid w-full sm:w-auto sm:min-w-[360px] grid-cols-2">
          <TabsTrigger value="entregas">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Preços de Entrega</span>
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <Package className="w-4 h-4 mr-2" />
            <span className="text-xs sm:text-sm">Produtos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entregas" className="space-y-4">
          <DeliveryPricesTab
            setPrecosEntrega={setPrecosEntrega}
            deletePrecoEntrega={deletePrecoEntrega}
          />
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <ProductsPricesTab
            setPrecosProdutos={setPrecosProdutos}
            deletePrecoProduto={deletePrecoProduto}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
