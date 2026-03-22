-- Create postcards table
CREATE TABLE IF NOT EXISTS postcards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    image_path VARCHAR(500),
    recipient_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_postcards_created_at ON postcards(created_at DESC);

-- Create index on recipient_email for lookups
CREATE INDEX IF NOT EXISTS idx_postcards_recipient_email ON postcards(recipient_email);

-- Add comment to table
COMMENT ON TABLE postcards IS 'Stores postcard data including images and recipient information';
