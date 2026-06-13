-- Create orders table for storing inventory orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  person_name TEXT NOT NULL,
  notes TEXT,
  items JSONB NOT NULL,
  total_items INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ordered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Enable Row Level Security (optional, for production security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust for production security)
CREATE POLICY "Allow all access to orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);
