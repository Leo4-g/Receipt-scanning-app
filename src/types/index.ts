export interface User {
  id: string;
  email: string | null;
}

export interface Receipt {
  id?: string;
  date: string;
  amount: number;
  vendor: string;
  tax_category: string;
  notes?: string;
  image_url?: string;
  user_id: string;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      receipts: {
        Row: Receipt;
        Insert: Omit<Receipt, 'id' | 'created_at'> & { created_at?: string };
        Update: Partial<Omit<Receipt, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at?: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: Partial<{
          email?: string | null;
        }>;
      };
    };
  };
}
