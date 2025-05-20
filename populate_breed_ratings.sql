-- SQL to add/update rating_profiles for breeds
  --
  -- NOTES:
  -- 1. This script updates the `breed_genetic_profile` JSONB column with `rating_profiles` for 10 breeds.
  -- 2. Uses increased std_dev (8 for conformation, 9 for gaits) for all breeds to reflect outliers.
  -- 3. The `||` operator merges `rating_profiles`, overwriting existing `rating_profiles` but preserving other keys.
  -- 4. Ensure `breeds` table exists with `breed_genetic_profile` as JSONB.
  -- 5. Verify breed IDs match your database.

  -- Update Thoroughbred (ID 1, Non-Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 78, "std_dev": 8 },
        "neck": { "mean": 75, "std_dev": 8 },
        "shoulders": { "mean": 72, "std_dev": 8 },
        "back": { "mean": 70, "std_dev": 8 },
        "hindquarters": { "mean": 76, "std_dev": 8 },
        "legs": { "mean": 74, "std_dev": 8 },
        "hooves": { "mean": 70, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 65, "std_dev": 9 },
        "trot": { "mean": 75, "std_dev": 9 },
        "canter": { "mean": 80, "std_dev": 9 },
        "gallop": { "mean": 90, "std_dev": 9 },
        "gaiting": null
      },
      "is_gaited_breed": false
    }
  }'::jsonb
  WHERE id = 1;

  -- Update Arabian (ID 2, Non-Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 85, "std_dev": 8 },
        "neck": { "mean": 82, "std_dev": 8 },
        "shoulders": { "mean": 70, "std_dev": 8 },
        "back": { "mean": 68, "std_dev": 8 },
        "hindquarters": { "mean": 72, "std_dev": 8 },
        "legs": { "mean": 70, "std_dev": 8 },
        "hooves": { "mean": 75, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 70, "std_dev": 9 },
        "trot": { "mean": 78, "std_dev": 9 },
        "canter": { "mean": 75, "std_dev": 9 },
        "gallop": { "mean": 80, "std_dev": 9 },
        "gaiting": null
      },
      "is_gaited_breed": false
    }
  }'::jsonb
  WHERE id = 2;

  -- Update American Saddlebred (ID 3, Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 80, "std_dev": 8 },
        "neck": { "mean": 78, "std_dev": 8 },
        "shoulders": { "mean": 72, "std_dev": 8 },
        "back": { "mean": 70, "std_dev": 8 },
        "hindquarters": { "mean": 74, "std_dev": 8 },
        "legs": { "mean": 72, "std_dev": 8 },
        "hooves": { "mean": 70, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 70, "std_dev": 9 },
        "trot": { "mean": 75, "std_dev": 9 },
        "canter": { "mean": 70, "std_dev": 9 },
        "gallop": { "mean": 65, "std_dev": 9 },
        "gaiting": { "mean": 85, "std_dev": 9 }
      },
      "is_gaited_breed": true
    }
  }'::jsonb
  WHERE id = 3;

  -- Update National Show Horse (ID 4, Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 82, "std_dev": 8 },
        "neck": { "mean": 80, "std_dev": 8 },
        "shoulders": { "mean": 71, "std_dev": 8 },
        "back": { "mean": 69, "std_dev": 8 },
        "hindquarters": { "mean": 73, "std_dev": 8 },
        "legs": { "mean": 71, "std_dev": 8 },
        "hooves": { "mean": 72, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 70, "std_dev": 9 },
        "trot": { "mean": 76, "std_dev": 9 },
        "canter": { "mean": 72, "std_dev": 9 },
        "gallop": { "mean": 70, "std_dev": 9 },
        "gaiting": { "mean": 82, "std_dev": 9 }
      },
      "is_gaited_breed": true
    }
  }'::jsonb
  WHERE id = 4;

  -- Update Pony of the Americas (ID 5, Non-Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 75, "std_dev": 8 },
        "neck": { "mean": 70, "std_dev": 8 },
        "shoulders": { "mean": 68, "std_dev": 8 },
        "back": { "mean": 65, "std_dev": 8 },
        "hindquarters": { "mean": 70, "std_dev": 8 },
        "legs": { "mean": 68, "std_dev": 8 },
        "hooves": { "mean": 68, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 65, "std_dev": 9 },
        "trot": { "mean": 70, "std_dev": 9 },
        "canter": { "mean": 68, "std_dev": 9 },
        "gallop": { "mean": 72, "std_dev": 9 },
        "gaiting": null
      },
      "is_gaited_breed": false
    }
  }'::jsonb
  WHERE id = 5;

  -- Update Appaloosa (ID 6, Non-Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 72, "std_dev": 8 },
        "neck": { "mean": 70, "std_dev": 8 },
        "shoulders": { "mean": 70, "std_dev": 8 },
        "back": { "mean": 68, "std_dev": 8 },
        "hindquarters": { "mean": 75, "std_dev": 8 },
        "legs": { "mean": 70, "std_dev": 8 },
        "hooves": { "mean": 70, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 65, "std_dev": 9 },
        "trot": { "mean": 70, "std_dev": 9 },
        "canter": { "mean": 72, "std_dev": 9 },
        "gallop": { "mean": 75, "std_dev": 9 },
        "gaiting": null
      },
      "is_gaited_breed": false
    }
  }'::jsonb
  WHERE id = 6;

  -- Update Tennessee Walking Horse (ID 7, Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 75, "std_dev": 8 },
        "neck": { "mean": 74, "std_dev": 8 },
        "shoulders": { "mean": 72, "std_dev": 8 },
        "back": { "mean": 70, "std_dev": 8 },
        "hindquarters": { "mean": 78, "std_dev": 8 },
        "legs": { "mean": 72, "std_dev": 8 },
        "hooves": { "mean": 70, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 72, "std_dev": 9 },
        "trot": { "mean": 65, "std_dev": 9 },
        "canter": { "mean": 70, "std_dev": 9 },
        "gallop": { "mean": 65, "std_dev": 9 },
        "gaiting": { "mean": 85, "std_dev": 9 }
      },
      "is_gaited_breed": true
    }
  }'::jsonb
  WHERE id = 7;

  -- Update Pura Raza Española (ID 8, Non-Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 80, "std_dev": 8 },
        "neck": { "mean": 78, "std_dev": 8 },
        "shoulders": { "mean": 72, "std_dev": 8 },
        "back": { "mean": 70, "std_dev": 8 },
        "hindquarters": { "mean": 76, "std_dev": 8 },
        "legs": { "mean": 72, "std_dev": 8 },
        "hooves": { "mean": 70, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 70, "std_dev": 9 },
        "trot": { "mean": 78, "std_dev": 9 },
        "canter": { "mean": 76, "std_dev": 9 },
        "gallop": { "mean": 70, "std_dev": 9 },
        "gaiting": null
      },
      "is_gaited_breed": false
    }
  }'::jsonb
  WHERE id = 8;

  -- Update American Quarter Horse (ID 9, Non-Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 75, "std_dev": 8 },
        "neck": { "mean": 72, "std_dev": 8 },
        "shoulders": { "mean": 74, "std_dev": 8 },
        "back": { "mean": 70, "std_dev": 8 },
        "hindquarters": { "mean": 78, "std_dev": 8 },
        "legs": { "mean": 74, "std_dev": 8 },
        "hooves": { "mean": 72, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 65, "std_dev": 9 },
        "trot": { "mean": 70, "std_dev": 9 },
        "canter": { "mean": 74, "std_dev": 9 },
        "gallop": { "mean": 80, "std_dev": 9 },
        "gaiting": null
      },
      "is_gaited_breed": false
    }
  }'::jsonb
  WHERE id = 9;

  -- Update Walkaloosa (ID 10, Gaited)
  UPDATE breeds
  SET breed_genetic_profile = breed_genetic_profile || 
  '{
    "rating_profiles": {
      "conformation": {
        "head": { "mean": 74, "std_dev": 8 },
        "neck": { "mean": 72, "std_dev": 8 },
        "shoulders": { "mean": 70, "std_dev": 8 },
        "back": { "mean": 68, "std_dev": 8 },
        "hindquarters": { "mean": 75, "std_dev": 8 },
        "legs": { "mean": 70, "std_dev": 8 },
        "hooves": { "mean": 70, "std_dev": 8 }
      },
      "gaits": {
        "walk": { "mean": 70, "std_dev": 9 },
        "trot": { "mean": 68, "std_dev": 9 },
        "canter": { "mean": 70, "std_dev": 9 },
        "gallop": { "mean": 72, "std_dev": 9 },
        "gaiting": { "mean": 85, "std_dev": 9 }
      },
      "is_gaited_breed": true
    }
  }'::jsonb
  WHERE id = 10;

 -- Paint Horse (ID 12, Non-Gaited)
UPDATE breeds
SET breed_genetic_profile = breed_genetic_profile || 
'{
  "rating_profiles": {
    "conformation": {
      "head": { "mean": 75, "std_dev": 8 },
      "neck": { "mean": 76, "std_dev": 8 },
      "shoulders": { "mean": 75, "std_dev": 8 },
      "back": { "mean": 74, "std_dev": 8 },
      "hindquarters": { "mean": 78, "std_dev": 8 },
      "legs": { "mean": 73, "std_dev": 8 },
      "hooves": { "mean": 73, "std_dev": 8 }
    },
    "gaits": {
      "walk": { "mean": 72, "std_dev": 9 },
      "trot": { "mean": 73, "std_dev": 9 },
      "canter": { "mean": 74, "std_dev": 9 },
      "gallop": { "mean": 73, "std_dev": 9 },
      "gaiting": null
    },
    "is_gaited_breed": false
  }
}'::jsonb
WHERE id = 12;

  -- Verification query
  SELECT id, name, breed_genetic_profile->'rating_profiles' as rating_profiles FROM breeds;