-- Add address type and gift option fields
ALTER TABLE addresses
ADD COLUMN address_type text DEFAULT 'billing' CHECK (address_type IN ('billing', 'shipping', 'both')),
ADD COLUMN notes text;

-- Add gift option to orders
ALTER TABLE orders
ADD COLUMN is_gift boolean DEFAULT false,
ADD COLUMN gift_message text;

-- Add more customer fields
ALTER TABLE customers
ADD COLUMN birth_date date,
ADD COLUMN gender text CHECK (gender IN ('M', 'F', 'other', 'prefer_not_say'));

-- Create index for better performance
CREATE INDEX idx_addresses_customer_type ON addresses(customer_id, address_type);
CREATE INDEX idx_addresses_default ON addresses(customer_id, is_default) WHERE is_default = true;