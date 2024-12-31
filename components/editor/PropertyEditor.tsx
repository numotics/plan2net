"use client";

import { useState } from "react";
import { useEditorStore, NetworkItem } from "@/lib/store";

export function PropertyEditor() {
  const { selectedNode, itemsRegistry, updateItem } = useEditorStore();

  const [newProperty, setNewProperty] = useState({ key: "", value: "" });
  const [editProperty, setEditProperty] = useState<{
    [key: string]: string | null;
  }>({});
  const [editKey, setEditKey] = useState<{ [key: string]: boolean }>({});
  const [editRegularProperty, setEditRegularProperty] = useState<{
    [key: string]: string | null;
  }>({});

  const selectedNetworkItem: NetworkItem | undefined = selectedNode
    ? itemsRegistry.find((item) => item.id === selectedNode)
    : undefined;

  const userProperties = selectedNetworkItem?.properties || {};
  const regularProperties = selectedNetworkItem
    ? (({ id, label, type }) => ({ id, label, type }))(selectedNetworkItem)
    : {};

  const handleEditRegularPropertyValue = (key: string, value: string) => {
    if (!selectedNode) return;

    const updatedItemIndex = itemsRegistry.findIndex(
      (item) => item.id === selectedNode
    );
    if (updatedItemIndex !== -1) {
      const updatedItem = { ...itemsRegistry[updatedItemIndex] };
      updatedItem[key] = value;
      updateItem(updatedItem);

      setEditRegularProperty((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleEditProperty = (
    oldKey: string,
    newKey: string,
    value: string | null
  ) => {
    // Ensure regular property keys are not editable
    if (!selectedNode || Object.keys(regularProperties).includes(oldKey)) return;

    const updatedItemIndex = itemsRegistry.findIndex(
      (item) => item.id === selectedNode
    );
    if (updatedItemIndex !== -1) {
      const updatedItem = itemsRegistry[updatedItemIndex];
      const properties = { ...updatedItem.properties };
      const orderedKeys = Object.keys(properties);

      const index = orderedKeys.indexOf(oldKey);
      if (index !== -1) {
        orderedKeys.splice(index, 1);
        orderedKeys.splice(index, 0, newKey);

        delete properties[oldKey];
        if (newKey.trim()) {
          properties[newKey] = value !== "" ? value : "NULL";
        }

        const updatedProperties = orderedKeys.reduce(
          (acc: Record<string, any>, key) => {
            acc[key] = properties[key];
            return acc;
          },
          {}
        );
        updatedItem.properties = updatedProperties;
        updateItem(updatedItem);

        setEditProperty((prev) => ({ ...prev, [oldKey]: null }));
        setEditKey((prev) => ({ ...prev, [oldKey]: false }));
      }
    }
  };

  const handleAddProperty = () => {
    if (!selectedNode || !newProperty.key.trim()) return;

    handleEditProperty(newProperty.key, newProperty.key, newProperty.value);
    setNewProperty({ key: "", value: "" });
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4">
      <h2 className="mb-4 font-semibold">Properties</h2>
      <div className="space-y-2">
        {Object.keys(regularProperties).length > 0 && (
          <div>
            <h3 className="font-semibold">Regular Properties</h3>
            {Object.entries(regularProperties).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-medium">{key}</span>
                <span
                  contentEditable={editRegularProperty[key] !== null}
                  suppressContentEditableWarning={true}
                  onClick={() =>
                    setEditRegularProperty((prev) => ({ ...prev, [key]: String(value) }))
                  }
                  onInput={(e) => {
                    const target = e.currentTarget;
                    setEditRegularProperty((prev) => ({
                      ...prev,
                      [key]: target.innerText,
                    }));
                  }}
                  onBlur={() => handleEditRegularPropertyValue(key, editRegularProperty[key] ?? String(value))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditRegularPropertyValue(key, editRegularProperty[key] ?? String(value));
                      e.currentTarget.blur();
                    }
                  }}
                  className="text-gray-600 text-right cursor-pointer outline-none no-underline focus:underline"
                >
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        )}
        {Object.keys(userProperties).length > 0 ? (
          <div>
            <h3 className="font-semibold mt-4">User Properties</h3>
            {Object.entries(userProperties).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span
                  contentEditable={editKey[key]}
                  suppressContentEditableWarning={true}
                  onClick={() => setEditKey((prev) => ({ ...prev, [key]: true }))}
                  onInput={(e) => {
                    const target = e.currentTarget;
                    setEditProperty((prev) => ({
                      ...prev,
                      [key]: target.innerText,
                    }));
                  }}
                  onBlur={() =>
                    handleEditProperty(key, editProperty[key] ?? key, value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditProperty(key, editProperty[key] ?? key, value);
                      e.currentTarget.blur();
                    }
                  }}
                  className="font-medium cursor-pointer outline-none"
                >
                  {key}
                </span>
                <span
                  contentEditable={editProperty[key] !== null}
                  suppressContentEditableWarning={true}
                  onClick={() =>
                    setEditProperty((prev) => ({ ...prev, [key]: String(value) }))
                  }
                  onInput={(e) => {
                    const target = e.currentTarget;
                    setEditProperty((prev) => ({
                      ...prev,
                      [key]: target.innerText,
                    }));
                  }}
                  onBlur={() => handleEditProperty(key, key, editProperty[key])}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleEditProperty(key, key, editProperty[key]);
                      e.currentTarget.blur();
                    }
                  }}
                  className="text-gray-600 text-right cursor-pointer outline-none no-underline focus:underline"
                >
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>No user properties to display</p>
        )}
        <div className="flex justify-between mt-4">
          <input
            className="w-1/2 p-1 border rounded"
            placeholder="Key"
            value={newProperty.key}
            onChange={(e) =>
              setNewProperty({ ...newProperty, key: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddProperty();
              }
            }}
          />
          <input
            className="w-1/2 p-1 border rounded"
            placeholder="Value"
            value={newProperty.value}
            onChange={(e) =>
              setNewProperty({ ...newProperty, value: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddProperty();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
