-- SQL to populate temperament_weights for 10 breeds
-- Each horse has ONE temperament from: Spirited, Nervous, Calm, Bold, Steady, Independent, Reactive, Stubborn, Playful, Lazy, Aggressive
-- Weights (in percent) determine likelihood of each temperament; sum to 100 for clarity
-- Uses || operator to merge temperament_weights into breed_genetic_profile, preserving other keys
-- IMPORTANT: Replace id values in WHERE clauses with actual breed IDs from your breeds table
-- Ensure temperament names match CHECK constraint in schema.sql

-- Thoroughbred (ID 1): High-energy, athletic, often high-strung (racing)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 30,
    "Nervous": 15,
    "Calm": 3,
    "Bold": 15,
    "Steady": 5,
    "Independent": 5,
    "Reactive": 15,
    "Stubborn": 3,
    "Playful": 5,
    "Lazy": 3,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 1;

-- Arabian (ID 2): Intelligent, spirited, loyal, sometimes stubborn (endurance/show)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 20,
    "Nervous": 10,
    "Calm": 5,
    "Bold": 25,
    "Steady": 5,
    "Independent": 10,
    "Reactive": 5,
    "Stubborn": 10,
    "Playful": 8,
    "Lazy": 1,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 2;

-- American Saddlebred (ID 3): Spirited yet gentle, showy, trainable (show ring)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 30,
    "Nervous": 2,
    "Calm": 10,
    "Bold": 20,
    "Steady": 10,
    "Independent": 5,
    "Reactive": 3,
    "Stubborn": 3,
    "Playful": 15,
    "Lazy": 1,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 3;

-- National Show Horse (ID 4): Blends Arabian sensitivity and Saddlebred showiness (performance)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 25,
    "Nervous": 5,
    "Calm": 8,
    "Bold": 20,
    "Steady": 8,
    "Independent": 5,
    "Reactive": 5,
    "Stubborn": 5,
    "Playful": 12,
    "Lazy": 1,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 4;

-- Pony of the Americas (ID 5): Gentle, versatile, kid-friendly (youth riding)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 5,
    "Nervous": 2,
    "Calm": 30,
    "Bold": 10,
    "Steady": 25,
    "Independent": 5,
    "Reactive": 2,
    "Stubborn": 5,
    "Playful": 10,
    "Lazy": 5,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 5;

-- Appaloosa (ID 6): Versatile, intelligent, even-tempered (western/trail)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 10,
    "Nervous": 2,
    "Calm": 25,
    "Bold": 15,
    "Steady": 25,
    "Independent": 5,
    "Reactive": 2,
    "Stubborn": 5,
    "Playful": 5,
    "Lazy": 5,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 6;

-- Tennessee Walking Horse (ID 7): Gentle, calm, smooth-gaited (trail/pleasure)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 5,
    "Nervous": 1,
    "Calm": 40,
    "Bold": 5,
    "Steady": 30,
    "Independent": 3,
    "Reactive": 1,
    "Stubborn": 3,
    "Playful": 5,
    "Lazy": 5,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 7;

-- Andalusian (ID 8): Noble, intelligent, expressive (dressage/classical)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 20,
    "Nervous": 5,
    "Calm": 10,
    "Bold": 25,
    "Steady": 10,
    "Independent": 5,
    "Reactive": 5,
    "Stubborn": 5,
    "Playful": 8,
    "Lazy": 1,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 8;

-- American Quarter Horse (ID 9): Steady, easygoing, versatile (western/ranch)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 10,
    "Nervous": 2,
    "Calm": 30,
    "Bold": 10,
    "Steady": 25,
    "Independent": 5,
    "Reactive": 2,
    "Stubborn": 5,
    "Playful": 5,
    "Lazy": 5,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 9;

-- Walkaloosa (ID 10): Docile, versatile, gaited (trail)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 5,
    "Nervous": 1,
    "Calm": 35,
    "Bold": 10,
    "Steady": 30,
    "Independent": 3,
    "Reactive": 1,
    "Stubborn": 3,
    "Playful": 5,
    "Lazy": 5,
    "Aggressive": 1
  }
}'::jsonb
WHERE id = 10;

-- Lusitano (ID 11): Courageous, agile, intelligent yet calm (dressage)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 20,
    "Nervous": 5,
    "Calm": 20,
    "Bold": 25,
    "Steady": 15,
    "Independent": 5,
    "Reactive": 3,
    "Stubborn": 3,
    "Playful": 10,
    "Lazy": 2,
    "Aggressive": 2
  }
}'::jsonb
WHERE id = 11;

-- Paint Horse (ID 12): Calm, steady, bold, versatile (Western disciplines)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 15,
    "Nervous": 2,
    "Calm": 25,
    "Bold": 20,
    "Steady": 20,
    "Independent": 5,
    "Reactive": 1,
    "Stubborn": 1,
    "Playful": 10,
    "Lazy": 1,
    "Aggressive": 0
  }
}'::jsonb
WHERE id = 12;

-- Verification query to check temperament_weights after update
SELECT id, name, breed_genetic_profile->'temperament_weights' as temperament_weights 
FROM breeds 
ORDER BY id;