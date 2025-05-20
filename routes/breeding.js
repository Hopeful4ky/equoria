const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const {
  calculateFoalGenetics,
  determinePhenotype,
} = require('../utils/geneticsEngine');
const {
  determineFoalTemperament,
} = require('../utils/temperamentEngine');
const { calculateFoalRatings } = require('../utils/ratingsEngine');

const BREEDER_LEVEL_MULTIPLIERS = {
  1: 0.55,
  2: 0.6,
  3: 0.65,
  4: 0.7,
  5: 0.75,
  default: 0.5, // For users who might not have a breeder_level or if it's outside 1-5
};

// @route   POST api/breeding/breed-horse
// @desc    Breed two horses to produce a foal
// @access  Private
router.post('/breed-horse', authMiddleware, async (req, res) => {
  const { mare_id, stallion_id } = req.body;
  const mare_owner_id = req.user.id;

  if (isNaN(parseInt(mare_id)) || isNaN(parseInt(stallion_id))) {
    return res
      .status(400)
      .json({ msg: 'Mare ID and Stallion ID must be numbers.' });
  }

  if (mare_id === stallion_id) {
    return res
      .status(400)
      .json({ msg: 'Mare and Stallion cannot be the same horse.' });
  }

  const client = await db.pool.connect(); // Get a client from the pool for transaction

  try {
    await client.query('BEGIN'); // Start transaction

    // 1. Fetch mare, stallion, and mare owner details (including their ratings)
    const parentHorseQueryFields = `
            h.id, h.name, h.owner_id, h.stable_id, h.breed_id, h.sex, h.date_of_birth, 
            h.genotype, h.phenotypic_markings, h.final_display_color, h.shade, h.image_url,
            h.precision, h.strength, h.speed, h.agility, h.endurance, h.personality, h.intelligence, 
            h.trait, h.temperament, h.sire_id, h.dam_id, h.stud_status, h.stud_fee, 
            h.last_bred_date, h.for_sale, h.sale_price, h.health_status, h.last_vetted_date,
            cr.head AS cr_head, cr.neck AS cr_neck, cr.shoulders AS cr_shoulders, 
            cr.back AS cr_back, cr.hindquarters AS cr_hindquarters, cr.legs AS cr_legs, cr.hooves AS cr_hooves,
            gr.walk AS gr_walk, gr.trot AS gr_trot, gr.canter AS gr_canter, 
            gr.gallop AS gr_gallop, gr.gaiting AS gr_gaiting
        `;

    const mareResult = await client.query(
      `SELECT ${parentHorseQueryFields}, u.breeder_level, u.game_currency as mare_owner_currency 
             FROM horses h 
             JOIN users u ON h.owner_id = u.id 
             LEFT JOIN conformation_ratings cr ON h.id = cr.horse_id
             LEFT JOIN gait_ratings gr ON h.id = gr.horse_id
             WHERE h.id = $1 AND u.id = $2`,
      [mare_id, mare_owner_id]
    );
    const stallionResult = await client.query(
      `SELECT ${parentHorseQueryFields}, u.game_currency as stallion_owner_currency, u.id as stallion_owner_user_id 
             FROM horses h 
             JOIN users u ON h.owner_id = u.id 
             LEFT JOIN conformation_ratings cr ON h.id = cr.horse_id
             LEFT JOIN gait_ratings gr ON h.id = gr.horse_id
             WHERE h.id = $1`,
      [stallion_id]
    );

    if (mareResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(404)
        .json({ msg: 'Mare not found or not owned by user.' });
    }
    if (stallionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ msg: 'Stallion not found.' });
    }

    const mare = mareResult.rows[0];
    const stallion = stallionResult.rows[0];
    const breeder_level = mare.breeder_level || 1;
    let mareOwnerCurrency = mare.mare_owner_currency;
    let stallionOwnerCurrency = stallion.stallion_owner_currency;
    const stallionOwnerUserId = stallion.stallion_owner_user_id;

    // 2. Validations
    if (mare.sex !== 'Mare') {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ msg: 'The first horse selected must be a Mare.' });
    }
    if (stallion.sex !== 'Stallion') {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ msg: 'The second horse selected must be a Stallion.' });
    }
    if (mare.owner_id !== mare_owner_id) {
      await client.query('ROLLBACK');
      return res
        .status(403)
        .json({ msg: 'User does not own the selected mare.' });
    }

    // Mare breeding cooldown (3 weeks)
    if (mare.last_bred_date) {
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      const lastBredDate = new Date(mare.last_bred_date);
      if (lastBredDate > threeWeeksAgo) {
        await client.query('ROLLBACK');
        const timeRemaining = Math.ceil(
          (lastBredDate.getTime() - threeWeeksAgo.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return res
          .status(400)
          .json({
            msg: `Mare is still on breeding cooldown. Time remaining: ${timeRemaining} days.`,
          });
      }
    }

    // Stallion stud status check
    if (stallion.stud_status === 'Not at Stud') {
      await client.query('ROLLBACK');
      return res
        .status(400)
        .json({ msg: 'Stallion is not currently available for stud.' });
    }

    let stud_fee_to_pay = 0;
    let breedingRequestId = null;

    if (stallion.stud_status === 'Private Stud') {
      const requestResult = await client.query(
        'SELECT id, stud_fee_at_request FROM breeding_requests WHERE mare_id = $1 AND stallion_id = $2 AND mare_owner_id = $3 AND stallion_owner_id = $4 AND status = $5',
        [mare.id, stallion.id, mare_owner_id, stallionOwnerUserId, 'accepted']
      );
      if (requestResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res
          .status(403)
          .json({
            msg: 'No accepted breeding request found for this private stud stallion and mare.',
          });
      }
      breedingRequestId = requestResult.rows[0].id;
      stud_fee_to_pay =
        requestResult.rows[0].stud_fee_at_request !== null
          ? requestResult.rows[0].stud_fee_at_request
          : stallion.stud_fee;
    } else if (stallion.stud_status === 'Public Stud') {
      stud_fee_to_pay = stallion.stud_fee;
    }

    if (stud_fee_to_pay > 0) {
      if (mareOwnerCurrency < stud_fee_to_pay) {
        await client.query('ROLLBACK');
        return res
          .status(400)
          .json({
            msg: 'Mare owner has insufficient funds to pay the stud fee.',
          });
      }
      const updatedMareOwnerCurrency = mareOwnerCurrency - stud_fee_to_pay;
      await client.query('UPDATE users SET game_currency = $1 WHERE id = $2', [
        updatedMareOwnerCurrency,
        mare_owner_id,
      ]);
      mareOwnerCurrency = updatedMareOwnerCurrency;

      if (stallionOwnerUserId !== mare_owner_id) {
        const updatedStallionOwnerCurrency =
          stallionOwnerCurrency + stud_fee_to_pay;
        await client.query(
          'UPDATE users SET game_currency = $1 WHERE id = $2',
          [updatedStallionOwnerCurrency, stallionOwnerUserId]
        );
      } else {
        const updatedStallionOwnerCurrencySelf =
          mareOwnerCurrency + stud_fee_to_pay;
        await client.query(
          'UPDATE users SET game_currency = $1 WHERE id = $2',
          [updatedStallionOwnerCurrencySelf, stallionOwnerUserId]
        );
      }
    }

    // 3. Determine Foal's Breed & Fetch Foal's Breed Genetic Profile
    let foal_breed_id;
    let foal_breed_profile;
    let foal_default_trait;

    if (mare.breed_id === stallion.breed_id) {
      foal_breed_id = mare.breed_id;
    } else {
      const breed1_id = Math.min(mare.breed_id, stallion.breed_id);
      const breed2_id = Math.max(mare.breed_id, stallion.breed_id);
      const crossbreedRuleResult = await client.query(
        'SELECT offspring_breed_id FROM crossbreed_rules WHERE breed1_id = $1 AND breed2_id = $2',
        [breed1_id, breed2_id]
      );
      if (crossbreedRuleResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res
          .status(400)
          .json({
            msg: 'This crossbreed is not allowed or no rule exists for it.',
          });
      }
      foal_breed_id = crossbreedRuleResult.rows[0].offspring_breed_id;
    }

    const foalBreedDetailsResult = await client.query(
      'SELECT breed_genetic_profile, default_trait FROM breeds WHERE id = $1',
      [foal_breed_id]
    );

    if (foalBreedDetailsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(500)
        .json({
          msg: 'Could not find breed details for the determined foal breed.',
        });
    }
    foal_breed_profile = foalBreedDetailsResult.rows[0].breed_genetic_profile;
    foal_default_trait = foalBreedDetailsResult.rows[0].default_trait;

    if (!foal_breed_profile) {
      await client.query('ROLLBACK');
      console.error(
        `Foal breed profile is null or undefined for breed_id: ${foal_breed_id}`
      );
      return res
        .status(500)
        .json({
          msg: 'Foal breed genetic profile is missing. Cannot proceed.',
        });
    }

    // Check for temperament weights, use default if missing (don't rollback for this)
    let foalTemperamentWeights = foal_breed_profile.temperament_weights;
    if (
      !foalTemperamentWeights ||
      typeof foalTemperamentWeights !== 'object' ||
      Object.keys(foalTemperamentWeights).length === 0
    ) {
      console.warn(
        `[BreedingRoute] Foal breed (ID: ${foal_breed_id}) is missing temperament_weights. Foal will get default temperament.`
      );
      // We will let determineFoalTemperament handle this by passing undefined, which will lead to DEFAULT_TEMPERAMENT
      foalTemperamentWeights = undefined;
    }

    // 4. Fetch Foal's Breed Genetic Profile. (Covered above)
    // 5. Calculate Foal Genotype using calculateFoalGenetics(sireGenotype, damGenotype, foalBreedGeneticProfile).
    const sireGenotype = stallion.genotype;
    const damGenotype = mare.genotype;

    if (!sireGenotype || !damGenotype) {
      await client.query('ROLLBACK');
      return res
        .status(500)
        .json({
          msg: 'Sire or Dam genotype is missing. Cannot calculate foal genetics.',
        });
    }

    const foalGenotype = await calculateFoalGenetics(
      sireGenotype,
      damGenotype,
      foal_breed_profile
    );
    if (Object.keys(foalGenotype).length === 0) {
      await client.query('ROLLBACK');
      return res
        .status(500)
        .json({
          msg: 'Failed to calculate foal genotype. Ensure parent genotypes and breed profile are complete.',
        });
    }

    // 6. Determine Foal Phenotype using determinePhenotype(foalGenotype, foalBreedGeneticProfile).
    const foalPhenotypeResult = await determinePhenotype(
      foalGenotype,
      foal_breed_profile
    );
    const {
      final_display_color,
      phenotypic_markings,
      determined_shade: foal_shade,
    } = foalPhenotypeResult;

    // 7. Calculate Foal Stats:
    const calculatedBreederMultiplier =
      BREEDER_LEVEL_MULTIPLIERS[breeder_level] ||
      BREEDER_LEVEL_MULTIPLIERS.default;

    const foalStats = {
      precision: Math.round(
        (((stallion.precision || 0) + (mare.precision || 0)) / 2) *
          calculatedBreederMultiplier
      ),
      strength: Math.round(
        (((stallion.strength || 0) + (mare.strength || 0)) / 2) *
          calculatedBreederMultiplier
      ),
      speed: Math.round(
        (((stallion.speed || 0) + (mare.speed || 0)) / 2) *
          calculatedBreederMultiplier
      ),
      agility: Math.round(
        (((stallion.agility || 0) + (mare.agility || 0)) / 2) *
          calculatedBreederMultiplier
      ),
      endurance: Math.round(
        (((stallion.endurance || 0) + (mare.endurance || 0)) / 2) *
          calculatedBreederMultiplier
      ),
      personality: Math.round(
        (((stallion.personality || 0) + (mare.personality || 0)) / 2) *
          calculatedBreederMultiplier
      ),
      intelligence: Math.round(
        (((stallion.intelligence || 0) + (mare.intelligence || 0)) / 2) *
          calculatedBreederMultiplier
      ),
    };

    // 8. Determine Foal Trait:
    // 50/50 chance to inherit trait from sire or dam. If a parent's trait is null/undefined, prefer the other, or use foal's default breed trait.
    let foalTrait;
    const sireTrait = stallion.trait;
    const damTrait = mare.trait;

    if (sireTrait && damTrait) {
      foalTrait = Math.random() < 0.5 ? sireTrait : damTrait;
    } else if (sireTrait) {
      foalTrait = sireTrait;
    } else if (damTrait) {
      foalTrait = damTrait;
    } else {
      foalTrait = foal_default_trait; // Fallback to foal's breed default trait
    }

    // 8b. Determine Foal Temperament
    const foalTemperament = determineFoalTemperament(
      stallion.temperament,
      mare.temperament,
      foalTemperamentWeights
    );

    // 8c. Prepare Parent Ratings for Foal Calculation
    const sireCombinedRatings = {
      conformation: {
        head: stallion.cr_head,
        neck: stallion.cr_neck,
        shoulders: stallion.cr_shoulders,
        back: stallion.cr_back,
        hindquarters: stallion.cr_hindquarters,
        legs: stallion.cr_legs,
        hooves: stallion.cr_hooves,
      },
      gaits: {
        walk: stallion.gr_walk,
        trot: stallion.gr_trot,
        canter: stallion.gr_canter,
        gallop: stallion.gr_gallop,
        gaiting: stallion.gr_gaiting,
      },
    };
    const damCombinedRatings = {
      conformation: {
        head: mare.cr_head,
        neck: mare.cr_neck,
        shoulders: mare.cr_shoulders,
        back: mare.cr_back,
        hindquarters: mare.cr_hindquarters,
        legs: mare.cr_legs,
        hooves: mare.cr_hooves,
      },
      gaits: {
        walk: mare.gr_walk,
        trot: mare.gr_trot,
        canter: mare.gr_canter,
        gallop: mare.gr_gallop,
        gaiting: mare.gr_gaiting,
      },
    };

    // 8d. Calculate Foal Conformation and Gait Ratings
    let foalConformationRatings, foalGaitRatings;
    if (!foal_breed_profile.rating_profiles) {
      console.warn(
        `[BreedingRoute] Foal breed (ID: ${foal_breed_id}) is missing rating_profiles. Foal will get default ratings (50s).`
      );
      // calculateFoalRatings will handle foalBreedRatingProfiles being undefined and default ratings
    }
    const calculatedRatings = calculateFoalRatings(
      sireCombinedRatings,
      damCombinedRatings,
      foal_breed_profile.rating_profiles
    );
    foalConformationRatings = calculatedRatings.conformationRatings;
    foalGaitRatings = calculatedRatings.gaitRatings;

    // 9. Create Foal Record in horses table:
    const foalName = 'Unnamed Foal'; // Placeholder
    const foalSex = Math.random() < 0.5 ? 'Colt' : 'Filly';
    const foalDob = new Date();

    const insertFoalQuery = `
            INSERT INTO horses (
                name, owner_id, stable_id, breed_id, sex, date_of_birth, 
                final_display_color, genotype, phenotypic_markings, shade, 
                sire_id, dam_id, 
                precision, strength, speed, agility, endurance, personality, intelligence, 
                trait, temperament, last_bred_date, stud_status, earnings, for_sale, sale_price
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 'Not at Stud', 0, false, 0
            ) RETURNING *;
        `;
    const foalValues = [
      foalName,
      mare_owner_id,
      null,
      foal_breed_id,
      foalSex,
      foalDob,
      final_display_color,
      foalGenotype,
      phenotypic_markings,
      foal_shade,
      stallion.id,
      mare.id,
      foalStats.precision,
      foalStats.strength,
      foalStats.speed,
      foalStats.agility,
      foalStats.endurance,
      foalStats.personality,
      foalStats.intelligence,
      foalTrait,
      foalTemperament,
      null,
    ];

    const foalResult = await client.query(insertFoalQuery, foalValues);

    if (foalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ msg: 'Failed to create foal record.' });
    }
    const foalCreated = foalResult.rows[0];

    // 9b. Insert Foal's Conformation and Gait Ratings
    const confoQuery = `
            INSERT INTO conformation_ratings (horse_id, head, neck, shoulders, back, hindquarters, legs, hooves)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
    await client.query(confoQuery, [
      foalCreated.id,
      foalConformationRatings.head,
      foalConformationRatings.neck,
      foalConformationRatings.shoulders,
      foalConformationRatings.back,
      foalConformationRatings.hindquarters,
      foalConformationRatings.legs,
      foalConformationRatings.hooves,
    ]);

    const gaitQuery = `
            INSERT INTO gait_ratings (horse_id, walk, trot, canter, gallop, gaiting)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
    await client.query(gaitQuery, [
      foalCreated.id,
      foalGaitRatings.walk,
      foalGaitRatings.trot,
      foalGaitRatings.canter,
      foalGaitRatings.gallop,
      foalGaitRatings.gaiting,
    ]);

    // 10. Update Mare's last_bred_date to NOW().
    const updateMareResult = await client.query(
      'UPDATE horses SET last_bred_date = $1 WHERE id = $2 RETURNING *',
      [new Date(), mare.id]
    );

    if (updateMareResult.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error(
        "CRITICAL: Foal created but mare's last_bred_date not updated for mare_id:",
        mare.id
      );
      return res
        .status(500)
        .json({
          msg: 'Failed to update mare last_bred_date. Foal creation rolled back.',
        });
    }
    const mareUpdated = updateMareResult.rows[0];

    // 11. Update breeding_request status if applicable
    if (breedingRequestId) {
      await client.query(
        'UPDATE breeding_requests SET status = $1, updated_at = NOW() WHERE id = $2',
        ['completed', breedingRequestId]
      );
    }

    await client.query('COMMIT'); // Commit transaction

    // Fetch the full foal data including ratings to return to client
    const fullFoalDataResult = await db.query(
      // Use db.query, transaction is committed
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
      [foalCreated.id]
    );

    const foalDataForResponse = fullFoalDataResult.rows[0] || foalCreated; // Fallback to foalCreated if join somehow fails

    res
      .status(200)
      .json({
        msg: 'Foal created successfully. Stud fee processed.',
        foal: foalDataForResponse,
        mare: mareUpdated,
      });
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on any error during the try block
    console.error('Error in /breed-horse transaction:', err.stack || err);
    res
      .status(500)
      .send('Server Error: Breeding process failed and was rolled back.');
  } finally {
    client.release(); // Release client back to the pool in all cases
  }
});

module.exports = router;
