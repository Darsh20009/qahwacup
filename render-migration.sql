-- Run this SQL in Render's PostgreSQL database console
-- This adds the missing columns to the existing tables

-- Add customer_notes column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Add card_number column to loyalty_cards table
ALTER TABLE loyalty_cards 
ADD COLUMN IF NOT EXISTS card_number VARCHAR(20) UNIQUE;

-- Update existing loyalty cards with card numbers (if needed)
-- This generates card numbers for existing cards that don't have one
UPDATE loyalty_cards 
SET card_number = 'LC-' || LPAD(CAST(FLOOR(RANDOM() * 999999) AS TEXT), 6, '0')
WHERE card_number IS NULL;
