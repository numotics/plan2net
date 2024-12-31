type Library = Record<string, {
  type: string;
  icon: string;
  properties?: any;
}>;
const storedLibrary = typeof window !== 'undefined' ? localStorage.getItem('itemLibrary') : null;
export const library: Library = storedLibrary
  ? JSON.parse(storedLibrary)
  : {
    router: {
      type: 'router',
      icon: "",
      properties: { ip: "10.0.0.1" }
    },
    switch: {
      type: 'switch',
      icon: "",
      properties: { ip: "10.0.0.1" }
    },
    server: {
      type: 'server',
      icon: ""
    },
    workstation: {
      type: 'workstation',
      icon: ""
    },
  };
