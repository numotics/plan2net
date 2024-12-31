import { Wifi, Server, Laptop, Router, LucideProps } from 'lucide-react';

type Library = Record<string, { 
  type: string; 
  icon: React.FC<LucideProps>; // TODO: Admit any icon (base64 svg)
  properties?: any;
}>;

export const library: Library = {
  router: { 
    type: 'router', 
    icon: Router, 
    properties: { ip: "10.0.0.1" }
  },
  switch: { 
    type: 'switch', 
    icon: Wifi, 
    properties: { ip: "10.0.0.1" }
  },
  server: { 
    type: 'server', 
    icon: Server 
  },
  workstation: { 
    type: 'workstation', 
    icon: Laptop 
  },
};

export const getIcon = (type: string): React.FC<LucideProps> => {
  return library[type]?.icon || Router;
}