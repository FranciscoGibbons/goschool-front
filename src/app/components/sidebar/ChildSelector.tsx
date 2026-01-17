"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDownIcon, UserIcon } from "@heroicons/react/24/outline";
import userInfoStore from "@/store/userInfoStore";
import childSelectionStore from "@/store/childSelectionStore";
import { Child } from "@/utils/types";

export default function ChildSelector() {
  const { userInfo } = userInfoStore();
  const { selectedChild, setSelectedChild } = childSelectionStore();
  const [isOpen, setIsOpen] = useState(false);

  const children = useMemo(
    () => userInfo?.children || [],
    [userInfo?.children]
  );

  // Si no hay hijo seleccionado, seleccionar el primero por defecto
  useEffect(() => {
    if (userInfo?.role === "father" && !selectedChild && children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, [children, selectedChild, setSelectedChild, userInfo?.role]);

  // Solo mostrar para padres
  if (userInfo?.role !== "father" || !children?.length) {
    return null;
  }

  const handleChildSelect = (child: Child) => {
    setSelectedChild(child);
    setIsOpen(false);
  };

  return (
    <div className="mb-6 border-b border-sidebar-border pb-4">
      <div className="mb-2">
        <span className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wide">
          Seleccionar Hijo
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-3 py-2 text-sidebar-foreground rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-sidebar-border"
        >
          <div className="flex items-center gap-2">
            <UserIcon className="size-4" />
            <span className="text-sm font-medium">
              {selectedChild
                ? `${selectedChild.name} ${selectedChild.last_name}`
                : "Seleccionar..."}
            </span>
          </div>
          <ChevronDownIcon
            className={`size-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-sidebar-border rounded-lg shadow-sm z-50">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildSelect(child)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground first:rounded-t-lg last:rounded-b-lg ${
                  selectedChild?.id === child.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground"
                }`}
              >
                <UserIcon className="size-4" />
                <div>
                  <div className="font-medium">
                    {child.name} {child.last_name}
                  </div>
                  {child.course_name && (
                    <div className="text-xs opacity-70">
                      {child.course_name}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedChild && (
        <div className="mt-2 text-xs text-sidebar-foreground/70">
          Viendo como: <span className="font-medium">{selectedChild.name}</span>
        </div>
      )}
    </div>
  );
}
