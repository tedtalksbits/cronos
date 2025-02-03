import { User } from '@/providers/AuthProvider';

export interface IHistory {
  _id: string;
  user: User;
  actionType: 'created' | 'updated' | 'deleted';
  entityId: string;
  entityType: string;
  diff?: {
    [key: string]: any;
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  createdAt: string;
  updatedAt: string;
  timestamp: string;
}
