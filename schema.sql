-- Drop tables in an order that respects foreign key constraints
DROP TABLE IF EXISTS breeding_requests CASCADE;
DROP TABLE IF EXISTS conformation_ratings CASCADE;
DROP TABLE IF EXISTS gait_ratings CASCADE;
DROP TABLE IF EXISTS horses CASCADE;
DROP TABLE IF EXISTS stables CASCADE;
DROP TABLE IF EXISTS crossbreed_rules CASCADE;
DROP TABLE IF EXISTS breeds CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table: Stores information about registered users.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    game_currency INT DEFAULT 10000 NOT NULL, -- Added for player currency
    user_type VARCHAR(10) DEFAULT 'basic' NOT NULL CHECK (user_type IN ('basic', 'premium')), -- For bank stipends
    last_bank_visit TIMESTAMPTZ NULL, -- For bank weekly cooldown
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- Added for admin roles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    breeder_level INT DEFAULT 1 CHECK (breeder_level BETWEEN 1 AND 5) -- Added for breeder job
);

-- Stables Table: Stores information about user-owned stables.
CREATE TABLE stables (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_stables_user_id ON stables(user_id);

-- Breeds Table: Stores information about different horse breeds and their genetic profiles.
CREATE TABLE breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    default_trait VARCHAR(255), -- e.g., "Gaited", "Jumping", "Speed"
    breed_genetic_profile JSONB NOT NULL, -- Stores allowed_alleles, disallowed_combinations, allele_weights, marking_bias, boolean_modifiers_prevalence, shade_bias, rating_profiles, temperament_weights
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_breed_genetic_profile CHECK (
        breed_genetic_profile ? 'allele_weights' AND
        breed_genetic_profile->'allele_weights' IS NOT NULL AND
        jsonb_typeof(breed_genetic_profile->'allele_weights') = 'object' AND
        breed_genetic_profile ? 'boolean_modifiers_prevalence' AND
        breed_genetic_profile->'boolean_modifiers_prevalence' IS NOT NULL AND
        jsonb_typeof(breed_genetic_profile->'boolean_modifiers_prevalence') = 'object' AND
        breed_genetic_profile ? 'rating_profiles' AND
        breed_genetic_profile->'rating_profiles' IS NOT NULL AND
        jsonb_typeof(breed_genetic_profile->'rating_profiles') = 'object' AND
        breed_genetic_profile ? 'temperament_weights' AND
        breed_genetic_profile->'temperament_weights' IS NOT NULL AND
        jsonb_typeof(breed_genetic_profile->'temperament_weights') = 'object'
    )
);

-- Crossbreed Rules Table: Defines valid crossbreeding pairs and their resulting offspring breed.
CREATE TABLE crossbreed_rules (
    id SERIAL PRIMARY KEY,
    breed1_id INTEGER NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
    breed2_id INTEGER NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
    offspring_breed_id INTEGER NOT NULL REFERENCES breeds(id) ON DELETE CASCADE,
    -- Ensure breed1_id is always less than breed2_id to simplify lookups and prevent duplicate rules (A x B is same as B x A)
    CONSTRAINT unique_crossbreed_pair UNIQUE (breed1_id, breed2_id),
    CONSTRAINT ordered_breed_ids CHECK (breed1_id < breed2_id),
    -- trait_inheritance_logic VARCHAR(50) DEFAULT '50/50_parental', -- e.g., '50/50_parental', 'prefer_breed1_trait', 'gaited_priority'
    notes TEXT, -- For any specific rules or comments, e.g., regarding trait inheritance specifics
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_crossbreed_rules_breed_pair ON crossbreed_rules(breed1_id, breed2_id);

-- Horses Table: Stores detailed information about each horse.
CREATE TABLE horses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    stable_id INTEGER REFERENCES stables(id) ON DELETE SET NULL,
    breed_id INTEGER REFERENCES breeds(id) ON DELETE RESTRICT NOT NULL,
    sex VARCHAR(50) NOT NULL CHECK (sex IN ('Stallion', 'Mare', 'Gelding', 'Colt', 'Filly')),
    date_of_birth DATE NOT NULL,
    
    -- Genetics & Appearance
    genotype JSONB NOT NULL,
    phenotypic_markings JSONB, -- e.g., {"face": "blaze", "legs": ["lf_stocking", "rh_sock"]}
    final_display_color VARCHAR(255),
    shade VARCHAR(100), -- Stores the determined shade like 'light', 'dark', 'golden'
    image_url VARCHAR(1024) DEFAULT '/images/samplehorse.JPG',

    -- Core Stats
    precision INTEGER DEFAULT 0 CHECK (precision >= 0 AND precision <= 100),
    strength INTEGER DEFAULT 0 CHECK (strength >= 0 AND strength <= 100),
    speed INTEGER DEFAULT 0 CHECK (speed >= 0 AND speed <= 100),
    agility INTEGER DEFAULT 0 CHECK (agility >= 0 AND agility <= 100),
    endurance INTEGER DEFAULT 0 CHECK (endurance >= 0 AND endurance <= 100),
    personality INTEGER DEFAULT 0 CHECK (personality >= 0 AND personality <= 100),
    intelligence INTEGER DEFAULT 0 CHECK (intelligence >=0 AND intelligence <=100), -- If we keep this distinct from personality
    trait VARCHAR(100), -- e.g., 'Show Jumping', 'Endurance Riding', 'Pleasure'
    temperament VARCHAR(50) CHECK (temperament IN (
        'Spirited', 'Nervous', 'Calm', 'Bold', 'Steady', 
        'Independent', 'Reactive', 'Stubborn', 'Playful', 'Lazy', 'Aggressive'
    )), -- Added temperament column with CHECK constraint

    -- Lineage
    sire_id INTEGER REFERENCES horses(id) ON DELETE SET NULL,
    dam_id INTEGER REFERENCES horses(id) ON DELETE SET NULL,

    -- Sale & Stud
    stud_status VARCHAR(50) DEFAULT 'Not at Stud' CHECK (stud_status IN ('Not at Stud', 'Public Stud', 'Private Stud')),
    stud_fee INTEGER DEFAULT 0 CHECK (stud_fee >= 0),
    last_bred_date DATE,
    for_sale BOOLEAN DEFAULT FALSE,
    sale_price INTEGER DEFAULT 0 CHECK (sale_price >= 0),

    -- Health & Vet
    health_status VARCHAR(50) DEFAULT 'Excellent' CHECK (health_status IN ('Excellent', 'Very Good', 'Good', 'Fair', 'Poor')),
    last_vetted_date DATE DEFAULT CURRENT_DATE,

    -- Misc
    tack JSONB DEFAULT '{}'::jsonb, -- e.g., {"saddle": "western_saddle_id", "bridle": "basic_bridle_id"}
    show_results JSONB DEFAULT '[]'::jsonb, -- Array of objects: {"show_id": 1, "class": "Halter", "placing": 1, "date": "YYYY-MM-DD"}
    total_earnings INTEGER DEFAULT 0 CHECK (total_earnings >= 0),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_horses_owner_id ON horses(owner_id);
CREATE INDEX idx_horses_breed_id ON horses(breed_id);
CREATE INDEX idx_horses_sire_id ON horses(sire_id);
CREATE INDEX idx_horses_dam_id ON horses(dam_id);
CREATE INDEX idx_horses_sex ON horses(sex);
CREATE INDEX idx_horses_for_sale ON horses(for_sale);
CREATE INDEX idx_horses_stud_status ON horses(stud_status);
CREATE INDEX idx_horses_trait ON horses(trait);
CREATE INDEX idx_horses_health_status ON horses(health_status);
CREATE INDEX idx_horses_last_vetted_date ON horses(last_vetted_date);
CREATE INDEX idx_horses_precision ON horses(precision);

-- Conformation Ratings Table
CREATE TABLE conformation_ratings (
    horse_id INTEGER PRIMARY KEY REFERENCES horses(id) ON DELETE CASCADE,
    head INTEGER NOT NULL CHECK (head BETWEEN 1 AND 100),
    neck INTEGER NOT NULL CHECK (neck BETWEEN 1 AND 100),
    shoulders INTEGER NOT NULL CHECK (shoulders BETWEEN 1 AND 100),
    back INTEGER NOT NULL CHECK (back BETWEEN 1 AND 100),
    hindquarters INTEGER NOT NULL CHECK (hindquarters BETWEEN 1 AND 100),
    legs INTEGER NOT NULL CHECK (legs BETWEEN 1 AND 100),
    hooves INTEGER NOT NULL CHECK (hooves BETWEEN 1 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conformation_ratings_horse_id ON conformation_ratings(horse_id);

-- Gait Ratings Table
CREATE TABLE gait_ratings (
    horse_id INTEGER PRIMARY KEY REFERENCES horses(id) ON DELETE CASCADE,
    walk INTEGER NOT NULL CHECK (walk BETWEEN 1 AND 100),
    trot INTEGER NOT NULL CHECK (trot BETWEEN 1 AND 100),
    canter INTEGER NOT NULL CHECK (canter BETWEEN 1 AND 100),
    gallop INTEGER NOT NULL CHECK (gallop BETWEEN 1 AND 100),
    gaiting INTEGER CHECK (gaiting BETWEEN 1 AND 100), -- Nullable for non-gaited breeds
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_gait_ratings_horse_id ON gait_ratings(horse_id);

-- Breeding Requests Table: Manages requests for private stud services.
CREATE TABLE breeding_requests (
    id SERIAL PRIMARY KEY,
    mare_id INTEGER NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    stallion_id INTEGER NOT NULL REFERENCES horses(id) ON DELETE CASCADE,
    mare_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stallion_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled_by_mare_owner', 'completed', 'expired')),
    stud_fee_at_request INTEGER NULL, -- The stud fee at the time of request
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_breeding_requests_mare_id_status ON breeding_requests(mare_id, status);
CREATE INDEX idx_breeding_requests_stallion_id_status ON breeding_requests(stallion_id, status);
CREATE INDEX idx_breeding_requests_mare_owner_id ON breeding_requests(mare_owner_id);
CREATE INDEX idx_breeding_requests_stallion_owner_id ON breeding_requests(stallion_owner_id);

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_stables
BEFORE UPDATE ON stables
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_breeds
BEFORE UPDATE ON breeds
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_horses
BEFORE UPDATE ON horses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_breeding_requests
BEFORE UPDATE ON breeding_requests
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_conformation_ratings
BEFORE UPDATE ON conformation_ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_gait_ratings
BEFORE UPDATE ON gait_ratings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();