export interface SavedAddress {
  id: string;
  label: string | null;
  name: string;
  address: string;
  city: string;
  country: string;
  postal: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
