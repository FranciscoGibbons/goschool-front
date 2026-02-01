"use client";

import { useState } from "react";
import { Plus, FileText, Shield, MessageSquare } from "lucide-react";
import { ProtectedPage } from "@/components/ProtectedPage";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import CircularesList from "./components/CircularesList";
import AutorizacionesList from "./components/AutorizacionesList";
import NotasIndividualesList from "./components/NotasIndividualesList";
import CircularForm from "./components/CircularForm";
import AutorizacionForm from "./components/AutorizacionForm";
import NotaForm from "./components/NotaForm";

type FormType = "circular" | "autorizacion" | "nota" | null;

function CuadernoContent() {
  const { userInfo } = userInfoStore();
  const { selectedChild } = childSelectionStore();
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [activeTab, setActiveTab] = useState("circulares");

  const canCreate = userInfo?.role === "admin" || userInfo?.role === "teacher" || userInfo?.role === "preceptor";

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (activeForm === "circular") {
    return <CircularForm onClose={() => setActiveForm(null)} />;
  }
  if (activeForm === "autorizacion") {
    return <AutorizacionForm onClose={() => setActiveForm(null)} />;
  }
  if (activeForm === "nota") {
    return <NotaForm onClose={() => setActiveForm(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Cuaderno de comunicaciones</h1>
            <p className="page-subtitle">Circulares, autorizaciones y notas individuales</p>
          </div>
          {canCreate && (
            <div className="flex gap-2">
              {activeTab === "circulares" && (
                <Button variant="default" size="sm" onClick={() => setActiveForm("circular")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva circular
                </Button>
              )}
              {activeTab === "autorizaciones" && (
                <Button variant="default" size="sm" onClick={() => setActiveForm("autorizacion")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva autorizacion
                </Button>
              )}
              {activeTab === "notas" && (
                <Button variant="default" size="sm" onClick={() => setActiveForm("nota")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva nota
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="circulares" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Circulares
          </TabsTrigger>
          <TabsTrigger value="autorizaciones" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Autorizaciones
          </TabsTrigger>
          <TabsTrigger value="notas" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="circulares">
          <CircularesList role={userInfo.role || ""} />
        </TabsContent>

        <TabsContent value="autorizaciones">
          <AutorizacionesList
            role={userInfo.role || ""}
            selectedChildId={selectedChild?.id}
          />
        </TabsContent>

        <TabsContent value="notas">
          <NotasIndividualesList
            role={userInfo.role || ""}
            selectedChildId={selectedChild?.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Cuaderno() {
  return (
    <ProtectedPage>
      <CuadernoContent />
    </ProtectedPage>
  );
}
