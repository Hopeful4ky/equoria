const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const {
  generateStoreHorseGenetics,
  determinePhenotype,
} = require('../utils/geneticsEngine');
const { generateStoreHorseRatings } = require('../utils/ratingsEngine'); // Import new ratings engine
const {
  determineStoreHorseTemperament,
// TODO: Remove unused 'DEFAULT_TEMPERAMENT' import or implement feature that uses it
// eslint-disable-next-line no-unused-vars
  DEFAULT_TEMPERAMENT,
} = require('../utils/temperamentEngine'); // Import temperament engine
const { calculateAgeInYears } = require('../utils/horseUtils'); // Import age calculation utility

// POST /api/store/purchase-horse - Purchase a horse from the store
router.post('/purchase-horse', authMiddleware, async (req, res, next) => {
  const { name, breed_id, sex } = req.body;
  const owner_id = req.user.id;

  // Validate input
  if (!name || !breed_id || !sex) {
    return res
      .status(400)
      .json({ message: 'Name, breed_id, and sex are required.' });
  }
  if (sex !== 'Stallion' && sex !== 'Mare') {
    return res
      .status(400)
      .json({
        message: 'Sex must be "Stallion" or "Mare" for store purchase.',
      });
  }

  const client = await db.pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Fetch breed details (including genetic profile and default trait)
    const breedResult = await client.query(
      'SELECT name, default_trait, breed_genetic_profile FROM breeds WHERE id = $1',
      [breed_id]
    );
    if (breedResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Breed not found.' });
    }
    const breed = breedResult.rows[0];
    const breedGeneticProfile = breed.breed_genetic_profile; // Full profile

    // Ensure breed_genetic_profile and rating_profiles exist
    if (!breedGeneticProfile || !breedGeneticProfile.rating_profiles) {
      await client.query('ROLLBACK');
      console.error(
        `Breed ${breed.name} (ID: ${breed_id}) is missing rating_profiles in its breed_genetic_profile.`
      );
      return res
        .status(500)
        .json({
          message: `Configuration error: Breed ${breed.name} is missing rating profiles.`,
        });
    }

    // Ensure temperament_weights exist
    if (!breedGeneticProfile.temperament_weights) {
      await client.query('ROLLBACK');
      console.error(
        `Breed ${breed.name} (ID: ${breed_id}) is missing temperament_weights in its breed_genetic_profile.`
      );
      return res
        .status(500)
        .json({
          message: `Configuration error: Breed ${breed.name} is missing temperament weights.`,
        });
    }

    // 2. Determine Date of Birth (3 years old)
    const currentDate = new Date();
    const date_of_birth = new Date(
      currentDate.setFullYear(currentDate.getFullYear() - 3)
    )
      .toISOString()
      .split('T')[0];

    // 3. Generate Genetics (Genotype, Final Display Color, Phenotypic Markings)
    const fullGenotype = await generateStoreHorseGenetics(breedGeneticProfile); // Pass full profile
    const { final_display_color, phenotypic_markings, determined_shade } =
      await determinePhenotype(fullGenotype, breedGeneticProfile, 3);

    // 4. Generate Initial Stats (randomly 0-20 for each)
    const randomStat = () => Math.floor(Math.random() * 21); // 0-20
    const precision = randomStat();
    const strength = randomStat();
    const speed = randomStat();
    const agility = randomStat();
    const endurance = randomStat();
    const personality = randomStat();

    // 5. Set Trait from breed default
    const trait = breed.default_trait;

    // 6. Determine Temperament
    const temperament = determineStoreHorseTemperament(
      breedGeneticProfile.temperament_weights
    );

    // 7. Insert new horse into the database
    const newHorseQuery = `
            INSERT INTO horses (
                name, owner_id, breed_id, sex, date_of_birth, final_display_color, 
                genotype, phenotypic_markings, precision, strength, speed, 
                agility, endurance, personality, trait, shade, temperament, 
                sire_id, dam_id, stable_id, image_url, stud_status, stud_fee, 
                last_bred_date, for_sale, sale_price, tack, show_results,
                health_status, last_vetted_date 
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                NULL, NULL, NULL, '/images/samplehorse.JPG', 'Not at Stud', 0, NULL, FALSE, 0, '{}', '{}',
                'Excellent', CURRENT_DATE
            ) RETURNING *;
        `;
    const newHorseParams = [
      name,
      owner_id,
      breed_id,
      sex,
      date_of_birth,
      final_display_color,
      fullGenotype,
      phenotypic_markings,
      precision,
      strength,
      speed,
      agility,
      endurance,
      personality,
      trait,
      determined_shade,
      temperament,
    ];

    const horseResult = await client.query(newHorseQuery, newHorseParams);
    const newHorse = horseResult.rows[0];

    // 8. Generate and Insert Conformation and Gait Ratings
    const { conformationRatings, gaitRatings } = generateStoreHorseRatings(
      breedGeneticProfile.rating_profiles
    );

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
      `SELECT h.*, 
                    cr.head, cr.neck, cr.shoulders, cr.back, cr.hindquarters, cr.legs, cr.hooves, 
                    gr.walk, gr.trot, gr.canter, gr.gallop, gr.gaiting 
             FROM horses h 
             LEFT JOIN conformation_ratings cr ON h.id = cr.horse_id 
             LEFT JOIN gait_ratings gr ON h.id = gr.horse_id 
             WHERE h.id = $1`,
      [newHorse.id]
    );

    let responseHorse = fullHorseDataResult.rows[0] || newHorse;
    if (responseHorse && !responseHorse.temperament && newHorse.temperament) {
      responseHorse.temperament = newHorse.temperament; // Ensure temperament is present
    }

    // Add age_years to the response object
    if (responseHorse && responseHorse.date_of_birth) {
      responseHorse.age_years = calculateAgeInYears(
        responseHorse.date_of_birth
      );
    }

    // Restructure ratings into nested objects for a cleaner API response
    if (responseHorse) {
      responseHorse.conformation_ratings = {
        head: responseHorse.head,
        neck: responseHorse.neck,
        shoulders: responseHorse.shoulders,
        back: responseHorse.back,
        hindquarters: responseHorse.hindquarters,
        legs: responseHorse.legs,
        hooves: responseHorse.hooves,
      };
      responseHorse.gait_ratings = {
        walk: responseHorse.walk,
        trot: responseHorse.trot,
        canter: responseHorse.canter,
        gallop: responseHorse.gallop,
        gaiting: responseHorse.gaiting,
      };

      // Remove flat properties if they were added by the join
      delete responseHorse.head;
      delete responseHorse.neck;
      delete responseHorse.shoulders;
      delete responseHorse.back;
      delete responseHorse.hindquarters;
      delete responseHorse.legs;
      delete responseHorse.hooves;
      delete responseHorse.walk;
      delete responseHorse.trot;
      delete responseHorse.canter;
      delete responseHorse.gallop;
      delete responseHorse.gaiting;
    }

    res
      .status(201)
      .json({ message: 'Horse purchased successfully!', horse: responseHorse });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on any error
    console.error('Error purchasing horse from store:', err.stack || err);
    next(err);
  } finally {
    client.release(); // Release client back to the pool
  }
});

module.exports = router;
