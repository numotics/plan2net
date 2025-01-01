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
  contentData: string;
  contentType: 'pdf' | 'image';
  setSelectedNode: (nodeId: string | null) => void;
  setZoomLevel: (level: number) => void;
  setIsDragging: (dragging: boolean) => void;
  addItem: (item: NetworkItem) => void;
  updateItem: (updatedItem: NetworkItem) => void;
  setContent: (data: string, type: 'pdf' | 'image') => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNode: null,
  zoomLevel: 1,
  isDragging: false,
  itemsRegistry: {},
  contentData: '',
  contentType: 'pdf',
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
  setContent: (data, type) => set({ contentData: data, contentType: type }),
}));

export const serializeProject = () => {
  const state = useEditorStore.getState();

  return JSON.stringify({
    contentData: state.contentData,
    contentType: state.contentType,
    itemsRegistry: state.itemsRegistry,
  });
};

export const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files![0];
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async () => {
    const data = reader.result as string;
    const parsedData = JSON.parse(data);
    const { contentData, contentType, itemsRegistry } = parsedData;
    useEditorStore.setState({
      contentData,
      contentType,
      itemsRegistry
    })
  }
}
