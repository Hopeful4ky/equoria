-- Example SQL to add/update temperament_weights for breeds
--
-- IMPORTANT:
-- 1. Replace the placeholder `id` values in `WHERE id = ...` with the actual IDs of your breeds.
-- 2. Customize the weight values for each temperament for each breed. These weights determine
--    the likelihood of a horse of this breed getting a particular temperament.
--    For clarity, it's often good if weights for a single breed sum to 100, but the selection
--    logic can normalize them if they don't.
-- 3. This script uses the `||` operator to merge the `temperament_weights` into the existing
--    `breed_genetic_profile`. If `temperament_weights` already exists, it will be overwritten.
--    Other top-level keys in `breed_genetic_profile` (like color or rating profiles) will be preserved.

/*
-- Example for Breed ID 1 (e.g., Thoroughbred)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 20,
    "Nervous": 10,
    "Calm": 5,
    "Bold": 15,
    "Steady": 10,
    "Independent": 5,
    "Reactive": 10,
    "Stubborn": 5,
    "Playful": 10,
    "Lazy": 5,
    "Aggressive": 5
  }
}'::jsonb
WHERE id = 1; -- Replace 1 with the actual ID of your breed

-- Example for Breed ID 2 (e.g., Quarter Horse)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "temperament_weights": {
    "Spirited": 10,
    "Nervous": 5,
    "Calm": 25,
    "Bold": 10,
    "Steady": 20,
    "Independent": 5,
    "Reactive": 5,
    "Stubborn": 5,
    "Playful": 5,
    "Lazy": 5,
    "Aggressive": 5
  }
}'::jsonb
WHERE id = 2; -- Replace 2 with the actual ID of your breed

-- Add more UPDATE statements for your other breeds below, following the examples.
-- Ensure the temperament names exactly match those in your schema.sql CHECK constraint:
-- ('Spirited', 'Nervous', 'Calm', 'Bold', 'Steady', 
--  'Independent', 'Reactive', 'Stubborn', 'Playful', 'Lazy', 'Aggressive')
*/

-- Reminder: Make sure to un-comment the blocks above and customize them for ALL your breeds before running this script.
-- SELECT id, name, breed_genetic_profile->'temperament_weights' as temperament_weights FROM breeds; -- Optional: to verify after update 