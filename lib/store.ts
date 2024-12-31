import { create } from 'zustand';

export interface NetworkItem {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
  pdfPosition: { x: number; y: number };
  properties?: Record<string, any>;
}

interface EditorState {
  selectedNode: string | null;
  zoomLevel: number;
  isDragging: boolean;
  itemsRegistry: Record<string, NetworkItem>;
  pdfURL: string;
  setSelectedNode: (nodeId: string | null) => void;
  setZoomLevel: (level: number) => void;
  setIsDragging: (dragging: boolean) => void;
  addItem: (item: NetworkItem) => void;
  updateItem: (updatedItem: NetworkItem) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNode: null,
  zoomLevel: 1,
  isDragging: false,
  itemsRegistry: {},
  pdfURL: "",
  setSelectedNode: (nodeId) => set({ selectedNode: nodeId }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  addItem: (item) => set((state) => ({
    itemsRegistry: { ...state.itemsRegistry, [item.id]: item }
  })),
  updateItem: (updatedItem) => set((state) => {
    if (!(updatedItem.id in state.itemsRegistry)) return {}; // Item not found

    return {
      itemsRegistry: {
        ...state.itemsRegistry,
        [updatedItem.id]: { ...state.itemsRegistry[updatedItem.id], ...updatedItem }
      },
    };
  }),
}));

export const serializeProject = () => {
  const state = useEditorStore.getState();

  return JSON.stringify({
    pdfURL: state.pdfURL, 
    itemsRegistry: state.itemsRegistry,
  });
};

export const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files![0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async () => {
    const data = reader.result as string;
    console.log(data);
    const parsedData = JSON.parse(data);
    const { pdfURL, itemsRegistry } = parsedData;
    useEditorStore.setState({
      pdfURL: pdfURL,
      itemsRegistry: itemsRegistry
    })
  }
}