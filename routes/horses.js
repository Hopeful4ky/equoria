const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { determinePhenotype } = require('../utils/geneticsEngine');
const { calculateAgeInYears } = require('../utils/horseUtils');
const { generateStoreHorseRatings } = require('../utils/ratingsEngine');
const {
  // TODO: Remove unused 'determineFoalTemperament' import or implement feature that uses it
// eslint-disable-next-line no-unused-vars
  determineFoalTemperament,
  determineStoreHorseTemperament,
} = require('../utils/temperamentEngine');

const ALLOWED_TEMPERAMENTS = [
  'Spirited',
  'Nervous',
  'Calm',
  'Bold',
  'Steady',
  'Independent',
  'Reactive',
  'Stubborn',
  'Playful',
  'Lazy',
  'Aggressive',
];

// @route   POST api/horses
// @desc    Create a new horse (Admin Only)
// @access  Private (Admin)
router.post('/', [authMiddleware, adminMiddleware], async (req, res, next) => {
  const {
    name, // Required, String
    breed_id, // Required, Integer
    sex, // Required, String ('Stallion', 'Mare', 'Colt', 'Filly')
    date_of_birth, // Required, String (MM-DD-YYYY)
    genotype, // Required, JSONB
    owner_id, // Optional, Integer (defaults to null or admin's ID? For now, null if not specified)
    stable_id, // Optional, Integer
    sire_id, // Optional, Integer
    dam_id, // Optional, Integer
    precision, // Optional, Integer (default 0)
    strength, // Optional, Integer (default 0)
    speed, // Optional, Integer (default 0)
    agility, // Optional, Integer (default 0)
    endurance, // Optional, Integer (default 0)
    personality, // Optional, Integer (default 0)
    intelligence, // Optional, Integer (default 0)
    trait, // Optional, String (if not provided, use breed's default_trait)
    image_url, // Optional, String
    stud_status, // Optional, String (default 'Not at Stud')
    stud_fee, // Optional, Integer (default 0)
    for_sale, // Optional, Boolean (default false)
    sale_price, // Optional, Integer (default 0)
    health_status, // Optional, String (defaults to 'Excellent')
    last_vetted_date, // Optional, String (YYYY-MM-DD, defaults to current date)
    // Ratings - optional, will be generated if not provided
    conformation_ratings: adminConformationRatings,
    gait_ratings: adminGaitRatings,
    temperament: adminTemperament, // Optional, String
    // earnings, last_bred_date, tack, show_results use DB defaults or are updated later
  } = req.body;

  // --- Basic Validation ---
  if (!name || !breed_id || !sex || !date_of_birth || !genotype) {
    return res
      .status(400)
      .json({
        message:
          'Name, breed_id, sex, date_of_birth, and genotype are required fields.',
      });
  }

  // Validate sex
  const validSexes = ['Stallion', 'Mare', 'Colt', 'Filly'];
  if (!validSexes.includes(sex)) {
    return res
      .status(400)
      .json({ message: `Sex must be one of: ${validSexes.join(', ')}` });
  }

  // Validate breed_id is a number
  if (isNaN(parseInt(breed_id))) {
    return res
      .status(400)
      .json({ message: 'breed_id must be a valid number.' });
  }
  const num_breed_id = parseInt(breed_id);

  // Validate date_of_birth format (MM-DD-YYYY) and convert
  const dobParts = date_of_birth.split('-');
  if (
    dobParts.length !== 3 ||
    isNaN(parseInt(dobParts[0])) ||
    isNaN(parseInt(dobParts[1])) ||
    isNaN(parseInt(dobParts[2]))
  ) {
    return res
      .status(400)
      .json({ message: 'date_of_birth must be in MM-DD-YYYY format.' });
  }
  const month = parseInt(dobParts[0]);
  const day = parseInt(dobParts[1]);
  const year = parseInt(dobParts[2]);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1900 ||
    year > new Date().getFullYear() + 5
  ) {
    // Basic sanity check for date parts
    return res
      .status(400)
      .json({ message: 'Invalid date parts for date_of_birth.' });
  }
  const formatted_dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Convert to YYYY-MM-DD for DB

  // Validate genotype is an object (further validation of its contents can be complex and might be part of geneticsEngine)
  if (typeof genotype !== 'object' || genotype === null) {
    return res
      .status(400)
      .json({ message: 'Genotype must be a valid JSON object.' });
  }

  // Validate health_status
  const validHealthStatuses = [
    'Excellent',
    'Very Good',
    'Good',
    'Fair',
    'Poor',
  ];
  if (
    health_status !== undefined &&
    !validHealthStatuses.includes(health_status)
  ) {
    return res
      .status(400)
      .json({
        message: `Health status must be one of: ${validHealthStatuses.join(', ')}`,
      });
  }

  // Validate last_vetted_date format (YYYY-MM-DD) if provided
  let formatted_lvd = new Date().toISOString().split('T')[0]; // Default to current date
  if (last_vetted_date !== undefined) {
    const lvdParts = last_vetted_date.split('-');
    if (
      lvdParts.length !== 3 ||
      isNaN(parseInt(lvdParts[0])) ||
      isNaN(parseInt(lvdParts[1])) ||
      isNaN(parseInt(lvdParts[2]))
    ) {
      return res
        .status(400)
        .json({ message: 'last_vetted_date must be in YYYY-MM-DD format.' });
    }
    const lvdYear = parseInt(lvdParts[0]);
    const lvdMonth = parseInt(lvdParts[1]);
    const lvdDay = parseInt(lvdParts[2]);
    // Basic sanity check for date parts
    if (
      lvdMonth < 1 ||
      lvdMonth > 12 ||
      lvdDay < 1 ||
      lvdDay > 31 ||
      lvdYear < 1900 ||
      lvdYear > new Date().getFullYear() + 5
    ) {
      return res
        .status(400)
        .json({ message: 'Invalid date parts for last_vetted_date.' });
    }
    formatted_lvd = `${lvdYear}-${String(lvdMonth).padStart(2, '0')}-${String(lvdDay).padStart(2, '0')}`;
  }

  // Optional fields validation (basic type checks)
  const optionalIntegerFields = {
    owner_id,
    stable_id,
    sire_id,
    dam_id,
    precision,
    strength,
    speed,
    agility,
    endurance,
    personality,
    intelligence,
    stud_fee,
    sale_price,
  };
  for (const field in optionalIntegerFields) {
    if (
      optionalIntegerFields[field] !== undefined &&
      (isNaN(parseInt(optionalIntegerFields[field])) ||
        parseInt(optionalIntegerFields[field]) < 0)
    ) {
      return res
        .status(400)
        .json({
          message: `${field} must be a valid non-negative integer if provided.`,
        });
    }
  }
  if (for_sale !== undefined && typeof for_sale !== 'boolean') {
    return res
      .status(400)
      .json({ message: 'for_sale must be a boolean if provided.' });
  }

  // More specific validation for IDs (e.g., if they exist in respective tables) can be added or handled by DB constraints

  const client = await db.pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query('BEGIN'); // Start transaction

    // --- Logic Implementation ---
    // 1. Fetch breed information (including breed_genetic_profile and default_trait)
    const breedResult = await client.query(
      'SELECT name, default_trait, breed_genetic_profile FROM breeds WHERE id = $1',
      [num_breed_id]
    );
    if (breedResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Breed not found.' });
    }
    const breedData = breedResult.rows[0];
    const breedGeneticProfile = breedData.breed_genetic_profile;
    const defaultBreedTrait = breedData.default_trait;

    // If breed_genetic_profile is missing in DB for the breed
    if (!breedGeneticProfile) {
      console.error(
        `FATAL: Breed ${num_breed_id} (${breedData.name}) is missing breed_genetic_profile.`
      );
      await client.query('ROLLBACK');
      return res
        .status(500)
        .json({
          message: `Configuration error: Breed ${breedData.name} is missing its genetic profile.`,
        });
    }

    // Ensure rating_profiles exist if we need to generate ratings
    let generateRatings = !adminConformationRatings || !adminGaitRatings; // Determine if we need to generate
    if (generateRatings && !breedGeneticProfile.rating_profiles) {
      console.error(
        `Configuration error: Breed ${breedData.name} (ID: ${num_breed_id}) is missing rating_profiles in its breed_genetic_profile. Cannot generate ratings.`
      );
      await client.query('ROLLBACK');
      return res
        .status(500)
        .json({
          message: `Configuration error: Breed ${breedData.name} is missing rating profiles required for generation.`,
        });
    }

    // 2. Calculate age in years (we need a utility function for this)
    const ageInYears = calculateAgeInYears(formatted_dob); // Use the utility function

    // 3. Determine Phenotype using the provided genotype and breed profile
    const { final_display_color, determined_shade, phenotypic_markings } =
      determinePhenotype(genotype, breedGeneticProfile, ageInYears);

    // If determinePhenotype did not return expected values (error or bad genotype/profile combo)
    if (!final_display_color) {
      // This might indicate an issue with the genotype or the engine's ability to process it with the given profile.
      // The engine should ideally throw an error if it fails critically, or return a default/error phenotype.
      console.error(
        'determinePhenotype failed to return a final_display_color. Genotype:',
        genotype,
        'Breed Profile:',
        breedGeneticProfile
      );
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({
          message:
            'Could not determine horse phenotype based on provided genotype and breed profile. Check genotype structure and breed data.',
        });
    }

    // 4. Determine the actual trait to be used
    const horseTrait = trait || defaultBreedTrait || null;

    // 4b. Determine/Validate Temperament
    let horseTemperament;
    if (adminTemperament) {
      if (!ALLOWED_TEMPERAMENTS.includes(adminTemperament)) {
        await client.query('ROLLBACK');
        return res
          .status(400)
          .json({
            message: `Invalid temperament value. Must be one of: ${ALLOWED_TEMPERAMENTS.join(', ')}`,
          });
      }
      horseTemperament = adminTemperament;
      console.log('Using admin-provided temperament:', horseTemperament);
    } else {
      if (!breedGeneticProfile.temperament_weights) {
        await client.query('ROLLBACK');
        console.error(
          `Configuration error: Breed ${breedData.name} (ID: ${num_breed_id}) is missing temperament_weights. Cannot generate temperament.`
        );
        return res
          .status(500)
          .json({
            message: `Configuration error: Breed ${breedData.name} is missing temperament weights required for generation.`,
          });
      }
      horseTemperament = determineStoreHorseTemperament(
        breedGeneticProfile.temperament_weights
      );
      console.log('Generated temperament:', horseTemperament);
    }

    // 5. Prepare data for insertion
    const horseData = {
      name,
      owner_id: owner_id !== undefined ? parseInt(owner_id) : null,
      stable_id: stable_id !== undefined ? parseInt(stable_id) : null,
      breed_id: num_breed_id,
      sex,
      date_of_birth: formatted_dob,
      genotype,
      final_display_color,
      shade: determined_shade,
      phenotypic_markings: phenotypic_markings || {},
      sire_id: sire_id !== undefined ? parseInt(sire_id) : null,
      dam_id: dam_id !== undefined ? parseInt(dam_id) : null,
      precision: precision !== undefined ? parseInt(precision) : 0,
      strength: strength !== undefined ? parseInt(strength) : 0,
      speed: speed !== undefined ? parseInt(speed) : 0,
      agility: agility !== undefined ? parseInt(agility) : 0,
      endurance: endurance !== undefined ? parseInt(endurance) : 0,
      personality: personality !== undefined ? parseInt(personality) : 0,
      intelligence: intelligence !== undefined ? parseInt(intelligence) : 0,
      trait: horseTrait,
      image_url: image_url || '/images/samplehorse.JPG',
      stud_status: stud_status || 'Not at Stud',
      stud_fee: stud_fee !== undefined ? parseInt(stud_fee) : 0,
      for_sale: for_sale !== undefined ? for_sale : false,
      sale_price: sale_price !== undefined ? parseInt(sale_price) : 0,
      health_status: health_status || 'Excellent',
      last_vetted_date: formatted_lvd,
      temperament: horseTemperament,
      // earnings, last_bred_date, tack, show_results use DB defaults or are updated later
    };

    // 6. Insert the new horse into the database
    const insertQuery = `
        INSERT INTO horses (
            name, owner_id, stable_id, breed_id, sex, date_of_birth, genotype, 
            final_display_color, shade, phenotypic_markings, sire_id, dam_id,
            precision, strength, speed, agility, endurance, personality, intelligence, trait,
            image_url, stud_status, stud_fee, for_sale, sale_price, health_status, last_vetted_date,
            temperament
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        ) RETURNING *;
    `;
    const insertParams = [
      horseData.name,
      horseData.owner_id,
      horseData.stable_id,
      horseData.breed_id,
      horseData.sex,
      horseData.date_of_birth,
      horseData.genotype,
      horseData.final_display_color,
      horseData.shade,
      horseData.phenotypic_markings,
      horseData.sire_id,
      horseData.dam_id,
      horseData.precision,
      horseData.strength,
      horseData.speed,
      horseData.agility,
      horseData.endurance,
      horseData.personality,
      horseData.intelligence,
      horseData.trait,
      horseData.image_url,
      horseData.stud_status,
      horseData.stud_fee,
      horseData.for_sale,
      horseData.sale_price,
      horseData.health_status,
      horseData.last_vetted_date,
      horseData.temperament,
    ];

    const newHorseResult = await client.query(insertQuery, insertParams);
    const newHorse = newHorseResult.rows[0];

    // 7. Determine and Insert Conformation and Gait Ratings
    let conformationRatings, gaitRatings;

    if (adminConformationRatings && adminGaitRatings) {
      // TODO: Add validation for admin-provided ratings (structure, value ranges 1-100)
      // For now, assume they are correct if provided
      conformationRatings = adminConformationRatings;
      gaitRatings = adminGaitRatings;
      console.log('Using admin-provided ratings for horse ID:', newHorse.id);
    } else {
      console.log(
        'Generating ratings for horse ID:',
        newHorse.id,
        'using breed profile.'
      );
      const generated = generateStoreHorseRatings(
        breedGeneticProfile.rating_profiles
      );
      conformationRatings = generated.conformationRatings;
      gaitRatings = generated.gaitRatings;
    }

    // Insert Conformation Ratings
    const confoQuery = `
        INSERT INTO conformation_ratings (horse_id, head, neck, shoulders, back, hindquarters, legs, hooves)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    await client.query(confoQuery, [
      newHorse.id,
      conformationRatings.head,
      conformationRatings.neck,
      conformationRatings.shoulders,
      conformationRatings.back,
      conformationRatings.hindquarters,
      conformationRatings.legs,
      conformationRatings.hooves,
    ]);

    // Insert Gait Ratings
    const gaitQuery = `
        INSERT INTO gait_ratings (horse_id, walk, trot, canter, gallop, gaiting)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    await client.query(gaitQuery, [
      newHorse.id,
      gaitRatings.walk,
      gaitRatings.trot,
      gaitRatings.canter,
      gaitRatings.gallop,
      gaitRatings.gaiting,
    ]);

    await client.query('COMMIT'); // Commit transaction

    // Fetch the full horse data including ratings to return to client
    const fullHorseDataResult = await db.query(
      // Use db.query here, not client.query, as transaction is committed
      `SELECT h.*, 
                cr.head AS conformation_head, cr.neck AS conformation_neck, cr.shoulders AS conformation_shoulders, 
                cr.back AS conformation_back, cr.hindquarters AS conformation_hindquarters, 
                cr.legs AS conformation_legs, cr.hooves AS conformation_hooves, 
                gr.walk AS gait_walk, gr.trot AS gait_trot, gr.canter AS gait_canter, 
                gr.gallop AS gait_gallop, gr.gaiting AS gait_gaiting
         FROM horses h 
         LEFT JOIN conformation_ratings cr ON h.id = cr.horse_id 
         LEFT JOIN gait_ratings gr ON h.id = gr.horse_id 
         WHERE h.id = $1`,
      [newHorse.id]
    );

    res.status(201).json(fullHorseDataResult.rows[0] || newHorse); // Fallback to newHorse if join fails
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on any error
    console.error('Error creating admin horse:', err.stack || err);
    if (err.constraint) {
      // Handle known DB constraint violations
      if (
        err.constraint === 'horses_sire_id_fkey' ||
        err.constraint === 'horses_dam_id_fkey'
      ) {
        return res
          .status(400)
          .json({
            message:
              'Invalid sire_id or dam_id. Referenced horse does not exist.',
          });
      }
      if (err.constraint === 'horses_breed_id_fkey') {
        // Should be caught by breed check earlier, but as a fallback
        return res
          .status(400)
          .json({
            message: 'Invalid breed_id. Referenced breed does not exist.',
          });
      }
      if (err.constraint === 'horses_owner_id_fkey') {
        return res
          .status(400)
          .json({
            message: 'Invalid owner_id. Referenced user does not exist.',
          });
      }
      if (err.constraint === 'horses_stable_id_fkey') {
        return res
          .status(400)
          .json({
            message: 'Invalid stable_id. Referenced stable does not exist.',
          });
      }
      // Add more specific constraint error handling if needed
      return res
        .status(400)
        .json({ message: `Database constraint violation: ${err.constraint}` });
    }
    next(err); // Pass to generic error handler
  } finally {
    client.release(); // Release client back to the pool
  }
});

// @route   GET api/horses
// @desc    Get all horses for the authenticated user
// @access  Private
router.get('/', authMiddleware, async (req, res, next) => {
  const owner_id = req.user.id; // From authMiddleware
  try {
    const userHorses = await db.query(
      'SELECT * FROM horses WHERE owner_id = $1 ORDER BY created_at DESC',
      [owner_id]
    );
    res.json(userHorses.rows);
  } catch (err) {
    console.error("Error fetching user's horses:", err.stack || err);
    next(err);
  }
});

// @route   GET api/horses/:id
// @desc    Get a specific horse by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res, next) => {
  const horseId = parseInt(req.params.id);

  if (isNaN(horseId)) {
    return res
      .status(400)
      .json({ message: 'Horse ID must be a valid number.' });
  }

  try {
    const horseResult = await db.query(
      'SELECT h.*, b.name as breed_name, u.username as owner_username ' +
        'FROM horses h ' +
        'LEFT JOIN breeds b ON h.breed_id = b.id ' +
        'LEFT JOIN users u ON h.owner_id = u.id ' +
        'WHERE h.id = $1',
      [horseId]
    );

    if (horseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Horse not found.' });
    }

    const horse = horseResult.rows[0];

    // Optional: Add a check here if only the owner or an admin should view certain details or the horse at all.
    // For now, any authenticated user can view if they have the ID.

    res.json(horse);
  } catch (err) {
    console.error(`Error fetching horse with ID ${horseId}:`, err.stack || err);
    next(err);
  }
});

// @route   DELETE api/horses/:id
// @desc    Delete a horse by ID (Admin Only)
// @access  Private (Admin)
router.delete(
  '/:id',
  [authMiddleware, adminMiddleware],
  async (req, res, next) => {
    const horseId = parseInt(req.params.id);

    if (isNaN(horseId)) {
      return res
        .status(400)
        .json({ message: 'Horse ID must be a valid number.' });
    }

    try {
      // First, check if the horse exists to provide a better error message
      const horseCheck = await db.query('SELECT id FROM horses WHERE id = $1', [
        horseId,
      ]);
      if (horseCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Horse not found.' });
      }

      // Delete the horse
      // Note: Foreign key constraints (e.g., sire_id, dam_id in other horses, breeding_requests)
      // are set to ON DELETE SET NULL or ON DELETE CASCADE in the schema, so this should be handled gracefully by the DB.
      const deleteResult = await db.query(
        'DELETE FROM horses WHERE id = $1 RETURNING id',
        [horseId]
      );

      if (deleteResult.rowCount === 0) {
        // Should have been caught by the check above, but as a safeguard
        return res
          .status(404)
          .json({ message: 'Horse not found or already deleted.' });
      }

      res.json({
        message: 'Horse deleted successfully.',
        deletedHorseId: horseId,
      });
    } catch (err) {
      console.error(
        `Error deleting horse with ID ${horseId}:`,
        err.stack || err
      );
      // Consider specific error codes, e.g., if deletion is blocked by a constraint not handled by SET NULL/CASCADE
      next(err);
    }
  }
);

// @route   PUT api/horses/:id
// @desc    Update a horse by ID (Admin: full update; Owner: limited update)
// @access  Private
router.put('/:id', authMiddleware, async (req, res, next) => {
  const horseId = parseInt(req.params.id);
  const userId = req.user.id;
  const userRole = req.user.role;

  if (isNaN(horseId)) {
    return res
      .status(400)
      .json({ message: 'Horse ID must be a valid number.' });
  }

  try {
    // 1. Fetch the existing horse
    const horseResult = await db.query('SELECT * FROM horses WHERE id = $1', [
      horseId,
    ]);
    if (horseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Horse not found.' });
    }
    const existingHorse = horseResult.rows[0];

    // 2. Authorization: Check if admin or owner
    const isAdmin = userRole === 'admin';
    const isOwner = existingHorse.owner_id === userId;

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: 'User not authorized to update this horse.' });
    }

    // 3. Prepare updates
    let newHorseData = { ...existingHorse }; // Start with existing data
    let needsPhenotypeRecalculation = false;
    let newAgeInYears = calculateAgeInYears(
      newHorseData.date_of_birth.toISOString().split('T')[0]
    ); // Current age

    if (isAdmin) {
      // Admin can update more fields
      const {
        name,
        breed_id,
        sex,
        date_of_birth,
        genotype,
        owner_id,
        stable_id,
        sire_id,
        dam_id,
        precision,
        strength,
        speed,
        agility,
        endurance,
        personality,
        intelligence,
        trait,
        image_url,
        stud_status,
        stud_fee,
        for_sale,
        sale_price,
        health_status,
        last_vetted_date,
        temperament,
      } = req.body;

      if (name !== undefined) newHorseData.name = name;
      if (owner_id !== undefined)
        newHorseData.owner_id = owner_id === null ? null : parseInt(owner_id);
      if (stable_id !== undefined)
        newHorseData.stable_id =
          stable_id === null ? null : parseInt(stable_id);
      if (sire_id !== undefined)
        newHorseData.sire_id = sire_id === null ? null : parseInt(sire_id);
      if (dam_id !== undefined)
        newHorseData.dam_id = dam_id === null ? null : parseInt(dam_id);
      if (precision !== undefined) newHorseData.precision = parseInt(precision);
      if (strength !== undefined) newHorseData.strength = parseInt(strength);
      if (speed !== undefined) newHorseData.speed = parseInt(speed);
      if (agility !== undefined) newHorseData.agility = parseInt(agility);
      if (endurance !== undefined) newHorseData.endurance = parseInt(endurance);
      if (personality !== undefined)
        newHorseData.personality = parseInt(personality);
      if (intelligence !== undefined)
        newHorseData.intelligence = parseInt(intelligence);
      if (trait !== undefined) newHorseData.trait = trait;
      if (image_url !== undefined) newHorseData.image_url = image_url;
      if (stud_status !== undefined) newHorseData.stud_status = stud_status;
      if (stud_fee !== undefined) newHorseData.stud_fee = parseInt(stud_fee);
      if (for_sale !== undefined) newHorseData.for_sale = for_sale;
      if (sale_price !== undefined)
        newHorseData.sale_price = parseInt(sale_price);
      if (health_status !== undefined) {
        const validHealthStatuses = [
          'Excellent',
          'Very Good',
          'Good',
          'Fair',
          'Poor',
        ];
        if (!validHealthStatuses.includes(health_status)) {
          return res
            .status(400)
            .json({
              message: `Health status must be one of: ${validHealthStatuses.join(', ')}`,
            });
        }
        newHorseData.health_status = health_status;
      }
      if (last_vetted_date !== undefined) {
        const lvdParts = last_vetted_date.split('-'); // Expects YYYY-MM-DD
        if (
          lvdParts.length !== 3 ||
          isNaN(parseInt(lvdParts[0])) ||
          isNaN(parseInt(lvdParts[1])) ||
          isNaN(parseInt(lvdParts[2]))
        ) {
          return res
            .status(400)
            .json({
              message:
                'last_vetted_date must be in YYYY-MM-DD format for admin update.',
            });
        }
        const lvdYear = parseInt(lvdParts[0]);
        const lvdMonth = parseInt(lvdParts[1]);
        const lvdDay = parseInt(lvdParts[2]);
        if (
          lvdMonth < 1 ||
          lvdMonth > 12 ||
          lvdDay < 1 ||
          lvdDay > 31 ||
          lvdYear < 1900 ||
          lvdYear > new Date().getFullYear() + 5
        ) {
          return res
            .status(400)
            .json({ message: 'Invalid date parts for last_vetted_date.' });
        }
        newHorseData.last_vetted_date = `${lvdYear}-${String(lvdMonth).padStart(2, '0')}-${String(lvdDay).padStart(2, '0')}`;
      }

      if (
        breed_id !== undefined &&
        parseInt(breed_id) !== newHorseData.breed_id
      ) {
        // Validate new breed_id exists
        const breedCheck = await db.query(
          'SELECT id, breed_genetic_profile, default_trait FROM breeds WHERE id = $1',
          [parseInt(breed_id)]
        );
        if (breedCheck.rows.length === 0)
          return res.status(400).json({ message: 'Invalid new breed_id.' });
        newHorseData.breed_id = parseInt(breed_id);
        // If breed changes, trait might need to be re-evaluated if not explicitly set
        if (
          trait === undefined &&
          newHorseData.trait !== breedCheck.rows[0].default_trait
        ) {
          newHorseData.trait = breedCheck.rows[0].default_trait;
        }
        needsPhenotypeRecalculation = true; // Breed profile change means phenotype recalc
      }

      if (date_of_birth !== undefined) {
        const dobParts = date_of_birth.split('-'); // Expects MM-DD-YYYY
        if (
          dobParts.length !== 3 ||
          isNaN(parseInt(dobParts[0])) ||
          isNaN(parseInt(dobParts[1])) ||
          isNaN(parseInt(dobParts[2]))
        ) {
          return res
            .status(400)
            .json({
              message:
                'date_of_birth must be in MM-DD-YYYY format for admin update.',
            });
        }
        const f_dob = `${dobParts[2]}-${String(dobParts[0]).padStart(2, '0')}-${String(dobParts[1]).padStart(2, '0')}`;
        if (newHorseData.date_of_birth.toISOString().split('T')[0] !== f_dob) {
          newHorseData.date_of_birth = f_dob;
          newAgeInYears = calculateAgeInYears(f_dob);
          needsPhenotypeRecalculation = true;
        }
      }

      if (
        sex !== undefined &&
        ['Stallion', 'Mare', 'Colt', 'Filly'].includes(sex) &&
        newHorseData.sex !== sex
      ) {
        newHorseData.sex = sex; // Allow admin to directly set sex, age-based changes handled below
      }

      // Age-based sex change if DOB was modified or if current sex is Colt/Filly
      const currentAgeForSexCheck = calculateAgeInYears(
        newHorseData.date_of_birth.toISOString().split('T')[0]
      );
      if (currentAgeForSexCheck >= 3) {
        if (newHorseData.sex === 'Colt') newHorseData.sex = 'Stallion';
        else if (newHorseData.sex === 'Filly') newHorseData.sex = 'Mare';
      } else {
        // age < 3
        if (newHorseData.sex === 'Stallion') newHorseData.sex = 'Colt';
        else if (newHorseData.sex === 'Mare') newHorseData.sex = 'Filly';
      }

      if (genotype !== undefined) {
        if (typeof genotype !== 'object' || genotype === null)
          return res
            .status(400)
            .json({
              message: 'Genotype must be a valid JSON object for admin update.',
            });
        newHorseData.genotype = genotype;
        needsPhenotypeRecalculation = true;
      }

      if (temperament !== undefined) {
        // Admin updating temperament
        if (!ALLOWED_TEMPERAMENTS.includes(temperament)) {
          return res
            .status(400)
            .json({
              message: `Invalid temperament value. Must be one of: ${ALLOWED_TEMPERAMENTS.join(', ')}`,
            });
        }
        newHorseData.temperament = temperament;
      }
    } else if (isOwner) {
      // Owner can only update specific fields
      const {
        name,
        image_url,
        stud_status,
        stud_fee,
        for_sale,
        sale_price,
        temperament: ownerAttemptedTemperament,
      } = req.body; // Check if owner tries to pass temperament
      let hasOwnerUpdates = false;

      if (ownerAttemptedTemperament !== undefined) {
        return res
          .status(403)
          .json({
            message: 'Owners are not allowed to update horse temperament.',
          });
      }

      if (name !== undefined && name !== newHorseData.name) {
        newHorseData.name = name;
        hasOwnerUpdates = true;
      }
      if (image_url !== undefined && image_url !== newHorseData.image_url) {
        // Add a note about content moderation being a separate concern
        console.log(
          'User updating image_url. Content moderation should be considered.'
        );
        newHorseData.image_url = image_url;
        hasOwnerUpdates = true;
      }
      if (
        stud_status !== undefined &&
        ['Not at Stud', 'Public Stud', 'Private Stud'].includes(stud_status) &&
        stud_status !== newHorseData.stud_status
      ) {
        newHorseData.stud_status = stud_status;
        hasOwnerUpdates = true;
        if (stud_status === 'Not at Stud') newHorseData.stud_fee = 0; // Reset fee if not at stud
      }
      if (
        stud_fee !== undefined &&
        !isNaN(parseInt(stud_fee)) &&
        parseInt(stud_fee) >= 0 &&
        parseInt(stud_fee) !== newHorseData.stud_fee
      ) {
        if (newHorseData.stud_status === 'Not at Stud')
          return res
            .status(400)
            .json({ message: 'Cannot set stud_fee if horse is Not at Stud.' });
        newHorseData.stud_fee = parseInt(stud_fee);
        hasOwnerUpdates = true;
      }
      if (
        for_sale !== undefined &&
        typeof for_sale === 'boolean' &&
        for_sale !== newHorseData.for_sale
      ) {
        newHorseData.for_sale = for_sale;
        hasOwnerUpdates = true;
        if (!for_sale) newHorseData.sale_price = 0; // Reset price if no longer for sale
      }
      if (
        sale_price !== undefined &&
        !isNaN(parseInt(sale_price)) &&
        parseInt(sale_price) >= 0 &&
        parseInt(sale_price) !== newHorseData.sale_price
      ) {
        if (!newHorseData.for_sale)
          return res
            .status(400)
            .json({
              message: 'Cannot set sale_price if horse is not for sale.',
            });
        newHorseData.sale_price = parseInt(sale_price);
        hasOwnerUpdates = true;
      }

      if (
        Object.keys(req.body).some(
          (key) =>
            ![
              'name',
              'image_url',
              'stud_status',
              'stud_fee',
              'for_sale',
              'sale_price',
            ].includes(key)
        )
      ) {
        return res
          .status(403)
          .json({
            message:
              'Owners can only update name, image_url, stud_status, stud_fee, for_sale, and sale_price.',
          });
      }
      if (!hasOwnerUpdates && Object.keys(req.body).length > 0) {
        return res
          .status(304)
          .json({
            message:
              'No valid fields provided for update or values are the same.',
          }); // Not Modified
      }
      if (Object.keys(req.body).length === 0) {
        return res
          .status(400)
          .json({ message: 'No fields provided for update.' });
      }
    }

    if (needsPhenotypeRecalculation) {
      const breedProfileResult = await db.query(
        'SELECT breed_genetic_profile FROM breeds WHERE id = $1',
        [newHorseData.breed_id]
      );
      if (
        breedProfileResult.rows.length === 0 ||
        !breedProfileResult.rows[0].breed_genetic_profile
      ) {
        return res
          .status(500)
          .json({
            message:
              'Could not retrieve breed genetic profile for phenotype recalculation.',
          });
      }
      const phenotypeResult = determinePhenotype(
        newHorseData.genotype,
        breedProfileResult.rows[0].breed_genetic_profile,
        newAgeInYears
      );
      newHorseData.final_display_color = phenotypeResult.final_display_color;
      newHorseData.shade = phenotypeResult.determined_shade;
      newHorseData.phenotypic_markings =
        phenotypeResult.phenotypic_markings || {};
    }

    // 4. Construct and execute update query
    // Ensure date_of_birth is in YYYY-MM-DD for the database
    const dobForDb =
      newHorseData.date_of_birth instanceof Date
        ? newHorseData.date_of_birth.toISOString().split('T')[0]
        : newHorseData.date_of_birth;

    const updateQuery = `
      UPDATE horses SET 
        name = $1, owner_id = $2, stable_id = $3, breed_id = $4, sex = $5, date_of_birth = $6, 
        genotype = $7, final_display_color = $8, shade = $9, phenotypic_markings = $10, 
        sire_id = $11, dam_id = $12, precision = $13, strength = $14, speed = $15, 
        agility = $16, endurance = $17, personality = $18, intelligence = $19, trait = $20, 
        image_url = $21, stud_status = $22, stud_fee = $23, for_sale = $24, sale_price = $25,
        health_status = $26, last_vetted_date = $27, temperament = $28, updated_at = NOW()
      WHERE id = $29 RETURNING *;
    `;
    const updateParams = [
      newHorseData.name,
      newHorseData.owner_id,
      newHorseData.stable_id,
      newHorseData.breed_id,
      newHorseData.sex,
      dobForDb,
      newHorseData.genotype,
      newHorseData.final_display_color,
      newHorseData.shade,
      newHorseData.phenotypic_markings,
      newHorseData.sire_id,
      newHorseData.dam_id,
      newHorseData.precision,
      newHorseData.strength,
      newHorseData.speed,
      newHorseData.agility,
      newHorseData.endurance,
      newHorseData.personality,
      newHorseData.intelligence,
      newHorseData.trait,
      newHorseData.image_url,
      newHorseData.stud_status,
      newHorseData.stud_fee,
      newHorseData.for_sale,
      newHorseData.sale_price,
      newHorseData.health_status,
      newHorseData.last_vetted_date,
      newHorseData.temperament,
      horseId,
    ];

    const updatedHorseResult = await db.query(updateQuery, updateParams);

    if (updatedHorseResult.rows.length === 0) {
      // Should not happen if initial check passed and ID is correct, but as a safeguard
      return res.status(500).json({ message: 'Failed to update horse.' });
    }

    res.json(updatedHorseResult.rows[0]);
  } catch (err) {
    console.error(`Error updating horse with ID ${horseId}:`, err.stack || err);
    if (err.constraint) {
      // Handle known DB constraint violations
      return res
        .status(400)
        .json({ message: `Database constraint violation: ${err.constraint}` });
    }
    next(err);
  }
});

// @route   PUT api/horses/:id/vet
// @desc    Vet a horse (sets health to Excellent and updates last_vetted_date)
// @access  Private (Owner only)
router.put('/:id/vet', authMiddleware, async (req, res, next) => {
  const horseId = parseInt(req.params.id);
  const userId = req.user.id;
  const vettingCost = 50; // Define vetting cost

  if (isNaN(horseId)) {
    return res
      .status(400)
      .json({ message: 'Horse ID must be a valid number.' });
  }

  const client = await db.pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Fetch the horse to check ownership and current status & user's currency
    const horseAndUserResult = await client.query(
      'SELECT h.id AS horse_id, h.owner_id, h.health_status, u.game_currency FROM horses h JOIN users u ON h.owner_id = u.id WHERE h.id = $1 AND u.id = $2',
      [horseId, userId]
    );

    if (horseAndUserResult.rows.length === 0) {
      await client.query('ROLLBACK');
      // Could be horse not found OR horse not owned by user.
      // For security, a generic message might be better, or check horse existence separately first if more specific errors are desired.
      return res
        .status(404)
        .json({ message: 'Horse not found or not owned by user.' });
    }

    const horseData = horseAndUserResult.rows[0];

    // User already confirmed to be the owner by the query JOIN and WHERE clause.
    // No need for: if (horseData.owner_id !== userId) { ... }

    // 2. Check if user has enough currency
    if (horseData.game_currency < vettingCost) {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({
          message: `Insufficient funds. Vetting costs ${vettingCost} game currency. You have ${horseData.game_currency}.`,
        });
    }

    // 3. Deduct currency
    const newCurrency = horseData.game_currency - vettingCost;
    await client.query('UPDATE users SET game_currency = $1 WHERE id = $2', [
      newCurrency,
      userId,
    ]);

    // 4. Update health status and last vetted date for the horse
    const updatedHorseResult = await client.query(
      'UPDATE horses SET health_status = $1, last_vetted_date = CURRENT_DATE, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['Excellent', horseId]
    );

    if (updatedHorseResult.rows.length === 0) {
      // Should not happen if initial check passed, but as a safeguard
      await client.query('ROLLBACK');
      console.error(
        `Failed to update horse ${horseId} during vetting, though it was found initially and currency was deducted.`
      );
      return res
        .status(500)
        .json({
          message:
            'Error vetting horse. Horse record may have changed unexpectedly. Transaction rolled back.',
        });
    }

    await client.query('COMMIT'); // Commit transaction
    res.json(updatedHorseResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on any error
    console.error(`Error vetting horse with ID ${horseId}:`, err.stack || err);
    next(err);
  } finally {
    client.release(); // Release client back to the pool
  }
});

module.exports = router;
