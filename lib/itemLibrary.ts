import { Wifi, Server, Laptop, Router, LucideProps } from 'lucide-react';

export const library = {
  "router": { id: 'router', label: 'Router', icon: Router },
  "switch": { id: 'switch', label: 'Switch', icon: Wifi },
  "server": { id: 'server', label: 'Server', icon: Server },
  "workstation": { id: 'workstation', label: 'Workstation', icon: Laptop },
};

export const getIcon = (type: string): React.FC<LucideProps> => {
  return Object.entries(library).find(([itemId, _]) => itemId === type)?.[1].icon || Router;
}