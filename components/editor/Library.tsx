"use client";

import { Plus } from "lucide-react";
import { library } from "@/lib/itemLibrary";
import { PortalModal } from "@/components/util/PortalModal";
import { useState } from "react";
import { createZodForm } from "@/lib/form-generator";
import { z } from "zod";
import { Button } from "../ui/button";

export function Library() {
  const [modalOpen, setModalOpen] = useState(false);

  const onDragStart = (e: React.DragEvent, itemType: string) => {
    e.dataTransfer.setData("application/reactflow", itemType);
    e.dataTransfer.effectAllowed = "move";
  };

  function parseProperties(input: string): Record<string, string> {
    const properties: Record<string, string> = {};

    input.split(",").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        properties[key.trim()] = value ? value.trim() : "";
      }
    });

    return properties;
  }

  const handleNewItem = (values: any) => {
    const newItem = {
      type: values.name,
      icon: values.icon_url,
      properties: parseProperties(values.properties),
    };

    const updatedLibrary = { ...library, [values.name]: newItem };
    localStorage.setItem("itemLibrary", JSON.stringify(updatedLibrary));
  };

  const formSchema = z.object({
    name: z.string(),
    icon_url: z.string(),
    properties: z.string(),
  });

  const Form = createZodForm({
    schema: formSchema,
    fields: {
      name: {
        label: "Name",
        type: "text",
      },
      icon_url: {
        label: "Icon (base64 url)",
        type: "text",
      },
      properties: {
        label: "Properties (i.e: ip=10.0.0.1,net,col)",
        type: "text",
      },
    },
    onSubmit(values) {
      handleNewItem(values);
    },
  });

  return (
    <div className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-4 font-semibold">Network Components</h2>
      <div className="space-y-2" suppressHydrationWarning>
        <div
          draggable
          onClick={() => {
            setModalOpen(true);
          }}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card p-2 hover:bg-accent"
        >
          <Plus className="h-5 w-5" />
          <span>Create Component...</span>
        </div>

        {Object.entries(library).map((entry) => {
          const item = entry[1];
          console.log(item)
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className="flex cursor-move items-center gap-2 rounded-lg border border-border bg-card p-2 hover:bg-accent"
            >
              <img src={item.icon} className="h-5 w-5" />
              <span>{item.type}</span>
            </div>
          );
        })}
      </div>

      <PortalModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <Form>
          <Button type="submit">Done</Button>
        </Form>
      </PortalModal>
    </div>
  );
}
