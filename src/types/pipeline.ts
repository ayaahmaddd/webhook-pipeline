export type Pipeline = {
  id: string;
  name: string;
  sourcePath: string;
  actionType: string;
  subscribers: string[];
  active: boolean;
  createdAt: string;
};