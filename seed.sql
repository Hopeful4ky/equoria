DO $$
DECLARE
  generic_profile JSONB;
BEGIN
  generic_profile := $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n", "Z/Z"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
      "W_DominantWhite": ["w/w", "W1/w", "W2/w", "W3/w", "W4/w", "W5/w", "W6/w", "W7/w",
        "W8/w", "W9/w", "W10/w", "W11/w", "W12/w", "W13/w", "W14/w", "W15/w", "W16/w",
        "W17/w", "W18/w", "W19/w", "W20/w", "W21/w", "W22/w", "W23/w", "W24/w", "W25/w",
        "W26/w", "W27/w", "W28/w", "W29/w", "W30/w", "W31/w", "W32/w", "W33/w", "W34/w",
        "W35/w", "W36/w", "W37/w", "W38/w", "W39/w"],
      "TO_Tobiano": ["to/to", "TO/to", "TO/TO"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n", "SW4/n", "SW5/n", "SW6/n", "SW7/n", "SW8/n", "SW9/n", "SW10/n"],
      "LP_LeopardComplex": ["lp/lp", "LP/lp", "LP/LP"],
      "PATN1_Pattern1": ["patn1/patn1", "PATN1/patn1", "PATN1/PATN1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N", "Mu/N", "Mu/Mu"],
      "Prl_Pearl": ["N/N", "N/Prl", "Prl/Prl", "Cr/Prl"],
      "BR1_Brindle1": ["N/N", "N/BR1", "BR1/BR1", "BR1/Y"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W5/W5", "W10/W10", "W13/W13", "W15/W15", "W19/W19", "W20/W20", "W22/W22", "W36/W36", "W37/W37", "W38/W38", "W39/W39"],
      "SW_SplashWhite": ["SW3/SW3", "SW4/SW4", "SW5/SW5", "SW6/SW6", "SW7/SW7", "SW8/SW8", "SW9/SW9", "SW10/SW10"],
      "EDXW": ["EDXW1/EDXW1", "EDXW2/EDXW2", "EDXW3/EDXW3"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.4, "E/E": 0.3},
      "A_Agouti": {"a/a": 0.3, "A/a": 0.4, "A/A": 0.3},
      "Cr_Cream": {"n/n": 0.8, "n/Cr": 0.15, "Cr/Cr": 0.05},
      "D_Dun": {"D/D": 0.02, "D/nd1": 0.05, "D/nd2": 0.05, "nd1/nd1": 0.10, "nd1/nd2": 0.10, "nd2/nd2": 0.68},
      "Z_Silver": {"n/n": 0.8, "Z/n": 0.15, "Z/Z": 0.05},
      "Ch_Champagne": {"n/n": 0.9, "Ch/n": 0.08, "Ch/Ch": 0.02},
      "G_Gray": {"g/g": 0.85, "G/g": 0.1, "G/G": 0.05},
      "Rn_Roan": {"rn/rn": 0.9, "Rn/rn": 0.09, "Rn/Rn": 0.01},
      "W_DominantWhite": {
        "w/w": 0.90,
        "W1/w": 0.002, "W2/w": 0.002, "W3/w": 0.002, "W4/w": 0.002, "W5/w": 0.002,
        "W6/w": 0.002, "W7/w": 0.002, "W8/w": 0.002, "W9/w": 0.002, "W10/w": 0.002,
        "W11/w": 0.002, "W12/w": 0.002, "W13/w": 0.002, "W14/w": 0.002, "W15/w": 0.002,
        "W16/w": 0.002, "W17/w": 0.002, "W18/w": 0.002, "W19/w": 0.002, "W20/w": 0.02,
        "W21/w": 0.002, "W22/w": 0.002, "W23/w": 0.002, "W24/w": 0.002, "W25/w": 0.002,
        "W26/w": 0.002, "W27/w": 0.002, "W28/w": 0.002, "W29/w": 0.002, "W30/w": 0.002,
        "W31/w": 0.002, "W32/w": 0.002, "W33/w": 0.002, "W34/w": 0.002, "W35/w": 0.002,
        "W36/w": 0.005, "W37/w": 0.005, "W38/w": 0.005, "W39/w": 0.005
      },
      "TO_Tobiano": {"to/to": 0.7, "TO/to": 0.25, "TO/TO": 0.05},
      "O_FrameOvero": {"n/n": 0.95, "O/n": 0.05},
      "SB1_Sabino1": {"n/n": 0.9, "SB1/n": 0.1},
      "SW_SplashWhite": {
        "n/n": 0.95, "SW1/n": 0.01, "SW2/n": 0.005, "SW3/n": 0.003,
        "SW4/n": 0.003, "SW5/n": 0.002, "SW6/n": 0.002, "SW7/n": 0.001,
        "SW8/n": 0.001, "SW9/n": 0.001, "SW10/n": 0.001
      },
      "LP_LeopardComplex": {"lp/lp": 0.8, "LP/lp": 0.15, "LP/LP": 0.05},
      "PATN1_Pattern1": {"patn1/patn1": 0.8, "PATN1/patn1": 0.15, "PATN1/PATN1": 0.05},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 0.98, "Mu/N": 0.015, "Mu/Mu": 0.005},
      "Prl_Pearl": {"N/N": 0.98, "N/Prl": 0.015, "Prl/Prl": 0.005, "Cr/Prl": 0.0},
      "BR1_Brindle1": {"N/N": 0.995, "N/BR1": 0.004, "BR1/BR1": 0.001, "BR1/Y": 0.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.2, "strip": 0.2, "blaze": 0.2, "snip": 0.2},
      "legs_general_probability": 0.5,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.3,
      "flaxen": 0.1,
      "pangare": 0.1,
      "rabicano": 0.05
    },
    "shade_bias": {
      "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
      "Mushroom Chestnut": {"taupe": 0.5, "warm gray": 0.3, "sepia": 0.2},
      "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Black": {"standard": 0.5, "faded": 0.5},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
      "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
      "Grulla": {"silver gray": 0.3, "standard": 0.4, "burnished": 0.3},
      "Red Dun": {"strawberry": 0.4, "medium": 0.3, "dark red": 0.3},
      "Bay Dun": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Cremello": {"ice": 0.5, "peachy": 0.5},
      "Perlino": {"cream": 0.5, "peachy": 0.5},
      "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
      "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
      "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
      "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
      "Gold Cream Champagne": {"pale": 0.3, "golden": 0.4, "burnished": 0.3},
      "Amber Cream Champagne": {"light": 0.3, "rich": 0.4, "dark": 0.3},
      "Classic Cream Champagne": {"light": 0.3, "silver": 0.4, "charcoal": 0.3},
      "Gold Dun Champagne": {"light": 0.3, "golden": 0.4, "red": 0.3},
      "Amber Dun Champagne": {"light": 0.3, "tan": 0.4, "burnished": 0.3},
      "Classic Dun Champagne": {"cool gray": 0.3, "iron": 0.4, "smoky": 0.3},
      "Gold Cream Dun Champagne": {"pale": 0.3, "golden": 0.4, "burnished": 0.3},
      "Amber Cream Dun Champagne": {"light": 0.3, "rich": 0.4, "dark": 0.3},
      "Classic Cream Dun Champagne": {"light gray": 0.3, "slate": 0.4, "charcoal": 0.3},
      "Silver Classic Champagne": {"light": 0.3, "silvery": 0.4, "dark": 0.3},
      "Silver Amber Dun Champagne": {"silver": 0.3, "tan": 0.4, "smoky": 0.3},
      "Silver Grulla": {"icy": 0.3, "gunmetal": 0.4, "shadow": 0.3},
      "Silver Buckskin": {"frosted": 0.3, "golden": 0.4, "burnished": 0.3},
      "Silver Bay": {"light": 0.3, "brushed bronze": 0.4, "burnished": 0.3},
      "Silver Black": {"steel": 0.5, "rich black": 0.5},
      "Silver Amber Cream Dun Champagne": {"frosted gold": 0.3, "silver tan": 0.4, "shadowed bronze": 0.3},
      "Blue Roan": {"steel": 0.4, "cool gray": 0.4, "charcoal": 0.2},
      "Red Roan": {"rose": 0.5, "cherry": 0.3, "rust": 0.2},
      "Strawberry Roan": {"pinkish": 0.4, "amber": 0.4, "wine": 0.2},
      "Fewspot Leopard": {"porcelain": 0.6, "frosted": 0.4},
      "Snowcap": {"cream": 0.4, "porcelain": 0.4, "ivory": 0.2},
      "Leopard": {"light spotted": 0.4, "freckled": 0.4, "bold spotted": 0.2},
      "Blanket": {"light blanket": 0.4, "mottled blanket": 0.4, "spotted blanket": 0.2},
      "Varnish Roan": {"roan wash": 0.4, "peppered": 0.4, "faded": 0.2},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Light Snowflake Leopard": {"light snowflake": 1.0},
      "Moderate Snowflake Leopard": {"moderate snowflake": 1.0},
      "Heavy Snowflake Leopard": {"heavy snowflake": 1.0},
      "Light Frost Roan Varnish": {"light frost": 1.0},
      "Moderate Frost Roan Varnish": {"moderate frost": 1.0},
      "Heavy Frost Roan Varnish": {"heavy frost": 1.0},
      "Bay Pearl": {"apricot": 0.4, "dark brown points": 0.6},
      "Chestnut Pearl": {"light pink-apricot": 1.0},
      "Black Pearl": {"light tan": 0.4, "dark points": 0.6},
      "Buckskin Pearl": {"light apricot": 0.4, "reddish-brown points": 0.6},
      "Palomino Pearl": {"pale apricot": 0.5, "pale mane": 0.5},
      "Smoky Black Pearl": {"pale tan": 0.4, "dark points": 0.6},
      "Brindle (Female)": {"vertical stripes": 0.7, "altered texture": 0.3},
      "Sparse Mane/Tail": {"sparse mane/tail": 1.0}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.0,
      "snowflake_probability_multiplier": 1.0,
      "frost_probability_multiplier": 1.0
    }
  }$json$;

  -- Insert Thoroughbred
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Thoroughbred', 'Racing', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr"],
      "D_Dun": ["nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n"],
      "Ch_Champagne": ["n/n"],
      "G_Gray": ["g/g", "G/g"],
      "Rn_Roan": ["rn/rn"],
      "W_DominantWhite": ["w/w", "W2/w", "W5/w", "W14/w", "W20/w", "W22/w"],
      "TO_Tobiano": ["to/to"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n"],
      "LP_LeopardComplex": ["lp/lp"],
      "PATN1_Pattern1": ["patn1/patn1"],
      "EDXW": ["n/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W2/W2", "W5/W5", "W14/W14", "W20/W20", "W22/W22"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.25, "E/e": 0.5, "E/E": 0.25},
      "A_Agouti": {"a/a": 0.2, "A/a": 0.5, "A/A": 0.3},
      "Cr_Cream": {"n/n": 0.999, "n/Cr": 0.001},
      "D_Dun": {"nd1/nd1": 0.10, "nd1/nd2": 0.20, "nd2/nd2": 0.70},
      "Z_Silver": {"n/n": 1.0},
      "Ch_Champagne": {"n/n": 1.0},
      "G_Gray": {"g/g": 0.9, "G/g": 0.09, "G/G": 0.01},
      "Rn_Roan": {"rn/rn": 1.0},
      "W_DominantWhite": {"w/w": 0.949, "W2/w": 0.01, "W5/w": 0.01, "W14/w": 0.005, "W20/w": 0.02, "W22/w": 0.005},
      "TO_Tobiano": {"to/to": 1.0},
      "O_FrameOvero": {"n/n": 0.99, "O/n": 0.01},
      "SB1_Sabino1": {"n/n": 0.99, "SB1/n": 0.01},
      "SW_SplashWhite": {"n/n": 0.995, "SW1/n": 0.003, "SW2/n": 0.001, "SW3/n": 0.001},
      "LP_LeopardComplex": {"lp/lp": 1.0},
      "PATN1_Pattern1": {"patn1/patn1": 1.0},
      "EDXW": {"n/n": 1.0},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.3, "star": 0.3, "strip": 0.2, "blaze": 0.1, "snip": 0.1},
      "legs_general_probability": 0.4,
      "leg_specific_probabilities": {
        "coronet": 0.4, "pastern": 0.3, "sock": 0.2, "stocking": 0.1
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.25,
      "flaxen": 0.05,
      "pangare": 0.02,
      "rabicano": 0.02
    },
    "shade_bias": {
  "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
  "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
  "Black": {"standard": 0.5, "faded": 0.5},
  "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
  "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
  "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
  "Grulla": {"silver gray": 0.3, "standard": 0.4, "burnished": 0.3},
  "Red Dun": {"strawberry": 0.4, "medium": 0.3, "dark red": 0.3},
  "Bay Dun": {"light": 0.3, "standard": 0.4, "dark": 0.3},

  "Leopard": {"light spotted": 0.4, "freckled": 0.4, "bold spotted": 0.2},
  "Fewspot Leopard": {"porcelain": 0.6, "frosted": 0.4},
  "Snowcap": {"cream": 0.4, "porcelain": 0.4, "ivory": 0.2},
  "Blanket": {"light blanket": 0.4, "mottled blanket": 0.4, "spotted blanket": 0.2},
  "Varnish Roan": {"roan wash": 0.4, "peppered": 0.4, "faded": 0.2},

  "Dominant White": {"white": 1.0},

  "Steel Gray": {"steel": 1.0},
  "Rose Gray": {"rose": 1.0},
  "Steel Dark Dapple Gray": {"steel dapple": 1.0},
  "Rose Dark Dapple Gray": {"rose dapple": 1.0},
  "Steel Light Dapple Gray": {"light steel dapple": 1.0},
  "Rose Light Dapple Gray": {"light rose dapple": 1.0},
  "White Gray": {"white gray": 1.0},
  "Fleabitten Gray": {"fleabitten": 1.0},

  "Default": {"standard": 1.0}
},
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.5,
      "snowflake_probability_multiplier": 0.0,
      "frost_probability_multiplier": 0.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert Arabian
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Arabian', 'Endurance', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n"],
      "D_Dun": ["nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n"],
      "Ch_Champagne": ["n/n"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn"],
      "W_DominantWhite": ["w/w", "W3/w", "W15/w", "W19/w", "W20/w"],
      "SB1_Sabino1": ["n/n"],
      "TO_Tobiano": ["to/to"],
      "O_FrameOvero": ["n/n"],
      "SW_SplashWhite": ["n/n"],
      "LP_LeopardComplex": ["lp/lp"],
      "PATN1_Pattern1": ["patn1/patn1"],
      "EDXW": ["n/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W3/W3", "W15/W15", "W19/W19", "W20/W20"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
      "A_Agouti": {"a/a": 0.1, "A/a": 0.4, "A/A": 0.5},
      "Cr_Cream": {"n/n": 1.0},
      "D_Dun": {"nd1/nd1": 0.15, "nd1/nd2": 0.25, "nd2/nd2": 0.60},
      "Z_Silver": {"n/n": 1.0},
      "Ch_Champagne": {"n/n": 1.0},
      "G_Gray": {"g/g": 0.5, "G/g": 0.4, "G/G": 0.1},
      "Rn_Roan": {"rn/rn": 1.0},
      "W_DominantWhite": {"w/w": 0.975, "W3/w": 0.005, "W15/w": 0.005, "W19/w": 0.005, "W20/w": 0.01},
      "SB1_Sabino1": {"n/n": 1.0},
      "TO_Tobiano": {"to/to": 1.0},
      "O_FrameOvero": {"n/n": 1.0},
      "SW_SplashWhite": {"n/n": 1.0},
      "LP_LeopardComplex": {"lp/lp": 1.0},
      "PATN1_Pattern1": {"patn1/patn1": 1.0},
      "EDXW": {"n/n": 1.0},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.3, "star": 0.3, "strip": 0.2, "blaze": 0.1, "snip": 0.1},
      "legs_general_probability": 0.4,
      "leg_specific_probabilities": {
        "coronet": 0.4, "pastern": 0.3, "sock": 0.2, "stocking": 0.1
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.05,
      "pangare": 0.01,
      "rabicano": 0.05
    },
    "shade_bias": {
  "Chestnut": { "light": 0.3, "medium": 0.4, "dark": 0.3 },
  "Bay": { "light": 0.3, "standard": 0.4, "dark": 0.3 },
  "Black": { "standard": 0.5, "faded": 0.5 },

  "Dominant White": { "white": 1.0 },

  "Steel Gray": { "steel": 1.0 },
  "Rose Gray": { "rose": 1.0 },
  "Steel Dark Dapple Gray": { "steel dapple": 1.0 },
  "Rose Dark Dapple Gray": { "rose dapple": 1.0 },
  "Steel Light Dapple Gray": { "light steel dapple": 1.0 },
  "Rose Light Dapple Gray": { "light rose dapple": 1.0 },
  "White Gray": { "white gray": 1.0 },
  "Fleabitten Gray": { "fleabitten": 1.0 },

  "Default": { "standard": 1.0 }
},
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 5.0,
      "snowflake_probability_multiplier": 0.0,
      "frost_probability_multiplier": 0.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert American Saddlebred
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('American Saddlebred', 'Gaited', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n"],
      "Ch_Champagne": ["n/n", "Ch/n"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to", "TO/to"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n"],
      "LP_LeopardComplex": ["lp/lp"],
      "PATN1_Pattern1": ["patn1/patn1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W20/W20"],
      "EDXW": ["EDXW1/EDXW1", "EDXW2/EDXW2", "EDXW3/EDXW3"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.4, "E/E": 0.3},
      "A_Agouti": {"a/a": 0.3, "A/a": 0.4, "A/A": 0.3},
      "Cr_Cream": {"n/n": 0.85, "n/Cr": 0.1, "Cr/Cr": 0.05},
      "D_Dun": {"D/D": 0.01, "D/nd1": 0.03, "D/nd2": 0.03, "nd1/nd1": 0.08, "nd1/nd2": 0.15, "nd2/nd2": 0.70},
      "Z_Silver": {"n/n": 0.95, "Z/n": 0.05},
      "Ch_Champagne": {"n/n": 0.97, "Ch/n": 0.03},
      "G_Gray": {"g/g": 0.85, "G/g": 0.1, "G/G": 0.05},
      "Rn_Roan": {"rn/rn": 1.0},
      "W_DominantWhite": {"w/w": 0.99, "W20/w": 0.01},
      "TO_Tobiano": {"to/to": 0.9, "TO/to": 0.1},
      "O_FrameOvero": {"n/n": 0.98, "O/n": 0.02},
      "SB1_Sabino1": {"n/n": 0.9, "SB1/n": 0.1},
      "SW_SplashWhite": {"n/n": 0.95, "SW1/n": 0.03, "SW2/n": 0.01, "SW3/n": 0.01},
      "LP_LeopardComplex": {"lp/lp": 1.0},
      "PATN1_Pattern1": {"patn1/patn1": 1.0},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.3, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.6,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.1,
      "pangare": 0.01,
      "rabicano": 0.05
    },
    "shade_bias": {
  "Chestnut": { "light": 0.3, "medium": 0.4, "dark": 0.3 },
  "Bay": { "light": 0.3, "standard": 0.4, "dark": 0.3 },
  "Black": { "standard": 0.5, "faded": 0.5 },

  "Palomino": { "pale": 0.3, "golden": 0.4, "copper": 0.3 },
  "Buckskin": { "cream": 0.3, "golden": 0.4, "burnished": 0.3 },
  "Smoky Black": { "faded": 0.5, "rich chocolate": 0.5 },

  "Cremello": { "ice": 0.5, "peachy": 0.5 },
  "Perlino": { "cream": 0.5, "peachy": 0.5 },
  "Smoky Cream": { "light cream": 0.5, "dark cream": 0.5 },

  "Gold Champagne": { "pale": 0.3, "golden": 0.4, "dark": 0.3 },
  "Amber Champagne": { "light": 0.3, "medium": 0.4, "deep": 0.3 },
  "Classic Champagne": { "faded": 0.3, "standard": 0.4, "rich": 0.3 },

  "Gold Cream Champagne": { "pale": 0.3, "golden": 0.4, "burnished": 0.3 },
  "Amber Cream Champagne": { "light": 0.3, "rich": 0.4, "dark": 0.3 },
  "Classic Cream Champagne": { "light": 0.3, "silver": 0.4, "charcoal": 0.3 },

  "Silver Bay": { "light": 0.3, "brushed bronze": 0.4, "burnished": 0.3 },
  "Silver Black": { "steel": 0.5, "rich black": 0.5 },
  "Silver Buckskin": { "frosted": 0.3, "golden": 0.4, "burnished": 0.3 },

  "Red Dun": { "strawberry": 0.4, "medium": 0.3, "dark red": 0.3 },
  "Bay Dun": { "light": 0.3, "standard": 0.4, "dark": 0.3 },
  "Grulla": { "silver gray": 0.3, "standard": 0.4, "burnished": 0.3 },

  "Dominant White": { "white": 1.0 },

  "Steel Gray": { "steel": 1.0 },
  "Rose Gray": { "rose": 1.0 },
  "Steel Dark Dapple Gray": { "steel dapple": 1.0 },
  "Rose Dark Dapple Gray": { "rose dapple": 1.0 },
  "Steel Light Dapple Gray": { "light steel dapple": 1.0 },
  "Rose Light Dapple Gray": { "light rose dapple": 1.0 },
  "White Gray": { "white gray": 1.0 },
  "Fleabitten Gray": { "fleabitten": 1.0 },

  "Default": { "standard": 1.0 }
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.2,
      "snowflake_probability_multiplier": 0.0,
      "frost_probability_multiplier": 0.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert National Show Horse
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('National Show Horse', 'Gaited or Endurance', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n", "Z/Z"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn"],
      "W_DominantWhite": ["w/w", "W3/w", "W15/w", "W19/w", "W20/w"],
      "TO_Tobiano": ["to/to", "TO/to"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n", "SW4/n", "SW5/n"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W3/W3", "W15/W15", "W19/W19", "W20/W20"],
      "SW_SplashWhite": ["SW3/SW3", "SW4/SW4", "SW5/SW5"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.25, "E/e": 0.5, "E/E": 0.25},
      "A_Agouti": {"a/a": 0.25, "A/a": 0.5, "A/A": 0.25},
      "Cr_Cream": {"n/n": 0.96, "n/Cr": 0.03, "Cr/Cr": 0.01},
      "D_Dun": {"D/D": 0.01, "D/nd1": 0.01, "D/nd2": 0.01, "nd1/nd1": 0.02, "nd1/nd2": 0.05, "nd2/nd2": 0.90},
      "Z_Silver": {"n/n": 0.98, "Z/n": 0.015, "Z/Z": 0.005},
      "Ch_Champagne": {"n/n": 0.98, "Ch/n": 0.015, "Ch/Ch": 0.005},
      "G_Gray": {"g/g": 0.9, "G/g": 0.08, "G/G": 0.02},
      "Rn_Roan": {"rn/rn": 1.0},
      "W_DominantWhite": {"w/w": 0.97, "W3/w": 0.005, "W15/w": 0.005, "W19/w": 0.005, "W20/w": 0.015},
      "TO_Tobiano": {"to/to": 0.95, "TO/to": 0.05},
      "O_FrameOvero": {"n/n": 0.99, "O/n": 0.01},
      "SB1_Sabino1": {"n/n": 0.95, "SB1/n": 0.05},
      "SW_SplashWhite": {"n/n": 0.97, "SW1/n": 0.01, "SW2/n": 0.005, "SW3/n": 0.003, "SW4/n": 0.0015, "SW5/n": 0.0005},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.25, "star": 0.25, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.45,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.25,
      "flaxen": 0.08,
      "pangare": 0.05,
      "rabicano": 0.02
    },
    "shade_bias": {
  "Chestnut": { "light": 0.3, "medium": 0.4, "dark": 0.3 },
  "Bay": { "light": 0.3, "standard": 0.4, "dark": 0.3 },
  "Black": { "standard": 0.5, "faded": 0.5 },

  "Palomino": { "pale": 0.3, "golden": 0.4, "copper": 0.3 },
  "Buckskin": { "cream": 0.3, "golden": 0.4, "burnished": 0.3 },
  "Smoky Black": { "faded": 0.5, "rich chocolate": 0.5 },

  "Cremello": { "ice": 0.5, "peachy": 0.5 },
  "Perlino": { "cream": 0.5, "peachy": 0.5 },
  "Smoky Cream": { "light cream": 0.5, "dark cream": 0.5 },

  "Gold Champagne": { "pale": 0.3, "golden": 0.4, "dark": 0.3 },
  "Amber Champagne": { "light": 0.3, "medium": 0.4, "deep": 0.3 },
  "Classic Champagne": { "faded": 0.3, "standard": 0.4, "rich": 0.3 },

  "Gold Cream Champagne": { "pale": 0.3, "golden": 0.4, "burnished": 0.3 },
  "Amber Cream Champagne": { "light": 0.3, "rich": 0.4, "dark": 0.3 },
  "Classic Cream Champagne": { "light": 0.3, "silver": 0.4, "charcoal": 0.3 },

  "Silver Bay": { "light": 0.3, "brushed bronze": 0.4, "burnished": 0.3 },
  "Silver Black": { "steel": 0.5, "rich black": 0.5 },
  "Silver Buckskin": { "frosted": 0.3, "golden": 0.4, "burnished": 0.3 },

  "Dominant White": { "white": 1.0 },

  "Red Dun": { "strawberry": 0.4, "medium": 0.3, "dark red": 0.3 },
  "Bay Dun": { "light": 0.3, "standard": 0.4, "dark": 0.3 },
  "Grulla": { "silver gray": 0.3, "standard": 0.4, "burnished": 0.3 },
  
  "Steel Gray": { "steel": 1.0 },
  "Rose Gray": { "rose": 1.0 },
  "Steel Dark Dapple Gray": { "steel dapple": 1.0 },
  "Rose Dark Dapple Gray": { "rose dapple": 1.0 },
  "Steel Light Dapple Gray": { "light steel dapple": 1.0 },
  "Rose Light Dapple Gray": { "light rose dapple": 1.0 },
  "White Gray": { "white gray": 1.0 },
  "Fleabitten Gray": { "fleabitten": 1.0 },

  "Default": { "standard": 1.0 }
},
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 2.5,
      "snowflake_probability_multiplier": 0.0,
      "frost_probability_multiplier": 0.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert Pony of the Americas
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Pony of the Americas', 'Hunter', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n", "Z/Z"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n"],
      "LP_LeopardComplex": ["lp/lp", "LP/lp", "LP/LP"],
      "PATN1_Pattern1": ["patn1/patn1", "PATN1/patn1", "PATN1/PATN1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W20/W20"],
      "SW_SplashWhite": ["SW2/SW2"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
      "A_Agouti": {"a/a": 0.25, "A/a": 0.5, "A/A": 0.25},
      "Cr_Cream": {"n/n": 0.95, "n/Cr": 0.04, "Cr/Cr": 0.01},
      "D_Dun": {"nd1/nd1": 0.1, "nd1/nd2": 0.2, "nd2/nd2": 0.7},
      "Z_Silver": {"n/n": 0.98, "Z/n": 0.015, "Z/Z": 0.005},
      "Ch_Champagne": {"n/n": 0.99, "Ch/n": 0.009, "Ch/Ch": 0.001},
      "G_Gray": {"g/g": 0.9, "G/g": 0.08, "G/G": 0.02},
      "Rn_Roan": {"rn/rn": 0.95, "Rn/rn": 0.04, "Rn/Rn": 0.01},
      "W_DominantWhite": {"w/w": 0.98, "W20/w": 0.02},
      "TO_Tobiano": {"to/to": 1.0},
      "O_FrameOvero": {"n/n": 0.99, "O/n": 0.01},
      "SB1_Sabino1": {"n/n": 0.95, "SB1/n": 0.05},
      "SW_SplashWhite": {"n/n": 0.97, "SW1/n": 0.02, "SW2/n": 0.01},
      "LP_LeopardComplex": {"lp/lp": 0.6, "LP/lp": 0.3, "LP/LP": 0.1},
      "PATN1_Pattern1": {"patn1/patn1": 0.6, "PATN1/patn1": 0.3, "PATN1/PATN1": 0.1},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.3, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.5,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.1,
      "pangare": 0.05,
      "rabicano": 0.02
    },
    "shade_bias": {
      "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
      "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Black": {"standard": 0.5, "faded": 0.5},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
      "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
      "Cremello": {"ice": 0.5, "peachy": 0.5},
      "Perlino": {"cream": 0.5, "peachy": 0.5},
      "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
      "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
      "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
      "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Fewspot Leopard": {"porcelain": 0.6, "frosted": 0.4},
      "Snowcap": {"cream": 0.4, "porcelain": 0.4, "ivory": 0.2},
      "Leopard": {"light spotted": 0.4, "freckled": 0.4, "bold spotted": 0.2},
      "Blanket": {"light blanket": 0.4, "mottled blanket": 0.4, "spotted blanket": 0.2},
      "Varnish Roan": {"roan wash": 0.4, "peppered": 0.4, "faded": 0.2},
      "Light Snowflake Leopard": {"light snowflake": 1.0},
      "Moderate Snowflake Leopard": {"moderate snowflake": 1.0},
      "Heavy Snowflake Leopard": {"heavy snowflake": 1.0},
      "Light Frost Roan Varnish": {"light frost": 1.0},
      "Moderate Frost Roan Varnish": {"moderate frost": 1.0},
      "Heavy Frost Roan Varnish": {"heavy frost": 1.0}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 2.5,
      "snowflake_probability_multiplier": 1.0,
      "frost_probability_multiplier": 1.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert Appaloosa
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Appaloosa', 'Western', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n", "Z/Z"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to", "TO/to", "TO/TO"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n"],
      "LP_LeopardComplex": ["lp/lp", "LP/lp", "LP/LP"],
      "PATN1_Pattern1": ["patn1/patn1", "PATN1/patn1", "PATN1/PATN1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W20/W20"],
      "SW_SplashWhite": ["SW2/SW2"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
      "A_Agouti": {"a/a": 0.25, "A/a": 0.5, "A/A": 0.25},
      "Cr_Cream": {"n/n": 0.95, "n/Cr": 0.04, "Cr/Cr": 0.01},
      "D_Dun": {"D/D": 0.05, "D/nd1": 0.1, "D/nd2": 0.1, "nd1/nd1": 0.25, "nd1/nd2": 0.25, "nd2/nd2": 0.25},
      "Z_Silver": {"n/n": 0.98, "Z/n": 0.015, "Z/Z": 0.005},
      "Ch_Champagne": {"n/n": 0.99, "Ch/n": 0.009, "Ch/Ch": 0.001},
      "G_Gray": {"g/g": 0.9, "G/g": 0.08, "G/G": 0.02},
      "Rn_Roan": {"rn/rn": 0.95, "Rn/rn": 0.04, "Rn/Rn": 0.01},
      "W_DominantWhite": {"w/w": 0.98, "W20/w": 0.02},
      "TO_Tobiano": {"to/to": 0.8, "TO/to": 0.15, "TO/TO": 0.05},
      "O_FrameOvero": {"n/n": 0.99, "O/n": 0.01},
      "SB1_Sabino1": {"n/n": 0.95, "SB1/n": 0.05},
      "SW_SplashWhite": {"n/n": 0.97, "SW1/n": 0.02, "SW2/n": 0.01},
      "LP_LeopardComplex": {"lp/lp": 0.2, "LP/lp": 0.6, "LP/LP": 0.2},
      "PATN1_Pattern1": {"patn1/patn1": 0.2, "PATN1/patn1": 0.6, "PATN1/PATN1": 0.2},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.3, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.5,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.1,
      "pangare": 0.05,
      "rabicano": 0.02
    },
    "shade_bias": {
      "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
      "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Black": {"standard": 0.5, "faded": 0.5},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
      "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
      "Grulla": {"silver gray": 0.3, "standard": 0.4, "burnished": 0.3},
      "Red Dun": {"strawberry": 0.4, "medium": 0.3, "dark red": 0.3},
      "Bay Dun": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Cremello": {"ice": 0.5, "peachy": 0.5},
      "Perlino": {"cream": 0.5, "peachy": 0.5},
      "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
      "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
      "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
      "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Fewspot Leopard": {"porcelain": 0.6, "frosted": 0.4},
      "Snowcap": {"cream": 0.4, "porcelain": 0.4, "ivory": 0.2},
      "Leopard": {"light spotted": 0.4, "freckled": 0.4, "bold spotted": 0.2},
      "Blanket": {"light blanket": 0.4, "mottled blanket": 0.4, "spotted blanket": 0.2},
      "Varnish Roan": {"roan wash": 0.4, "peppered": 0.4, "faded": 0.2},
      "Light Snowflake Leopard": {"light snowflake": 1.0},
      "Moderate Snowflake Leopard": {"moderate snowflake": 1.0},
      "Heavy Snowflake Leopard": {"heavy snowflake": 1.0},
      "Light Frost Roan Varnish": {"light frost": 1.0},
      "Moderate Frost Roan Varnish": {"moderate frost": 1.0},
      "Heavy Frost Roan Varnish": {"heavy frost": 1.0}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 2.5,
      "snowflake_probability_multiplier": 1.0,
      "frost_probability_multiplier": 1.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

    -- Insert Tennessee Walking Horse
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Tennessee Walking Horse', 'Gaited', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to", "TO/to", "TO/TO"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n"],
      "LP_LeopardComplex": ["lp/lp"],
      "PATN1_Pattern1": ["patn1/patn1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W20/W20"],
      "SW_SplashWhite": ["SW2/SW2"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
      "A_Agouti": {"a/a": 0.25, "A/a": 0.5, "A/A": 0.25},
      "Cr_Cream": {"n/n": 0.95, "n/Cr": 0.04, "Cr/Cr": 0.01},
      "D_Dun": {"nd1/nd1": 0.1, "nd1/nd2": 0.2, "nd2/nd2": 0.7},
      "Z_Silver": {"n/n": 1.0},
      "Ch_Champagne": {"n/n": 0.99, "Ch/n": 0.009, "Ch/Ch": 0.001},
      "G_Gray": {"g/g": 0.85, "G/g": 0.1, "G/G": 0.05},
      "Rn_Roan": {"rn/rn": 0.8, "Rn/rn": 0.15, "Rn/Rn": 0.05},
      "W_DominantWhite": {"w/w": 0.98, "W20/w": 0.02},
      "TO_Tobiano": {"to/to": 0.7, "TO/to": 0.25, "TO/TO": 0.05},
      "O_FrameOvero": {"n/n": 0.99, "O/n": 0.01},
      "SB1_Sabino1": {"n/n": 0.9, "SB1/n": 0.1},
      "SW_SplashWhite": {"n/n": 0.97, "SW1/n": 0.02, "SW2/n": 0.01},
      "LP_LeopardComplex": {"lp/lp": 1.0},
      "PATN1_Pattern1": {"patn1/patn1": 1.0},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.3, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.6,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.1,
      "pangare": 0.05,
      "rabicano": 0.05
    },
    "shade_bias": {
      "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
      "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Black": {"standard": 0.5, "faded": 0.5},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
      "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
      "Cremello": {"ice": 0.5, "peachy": 0.5},
      "Perlino": {"cream": 0.5, "peachy": 0.5},
      "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
      "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
      "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
      "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Blue Roan": {"steel": 0.4, "cool gray": 0.4, "charcoal": 0.2},
      "Red Roan": {"rose": 0.5, "cherry": 0.3, "rust": 0.2}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.5,
      "snowflake_probability_multiplier": 0.0,
      "frost_probability_multiplier": 0.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert Andalusian
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Andalusian', 'Dressage', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr"],
      "D_Dun": ["nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n"],
      "Ch_Champagne": ["n/n"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to"],
      "O_FrameOvero": ["n/n"],
      "SB1_Sabino1": ["n/n"],
      "SW_SplashWhite": ["n/n"],
      "LP_LeopardComplex": ["lp/lp"],
      "PATN1_Pattern1": ["patn1/patn1"],
      "EDXW": ["n/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N", "N/Prl", "Prl/Prl", "Cr/Prl"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "W_DominantWhite": ["W20/W20"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.2, "E/e": 0.5, "E/E": 0.3},
      "A_Agouti": {"a/a": 0.1, "A/a": 0.4, "A/A": 0.5},
      "Cr_Cream": {"n/n": 0.99, "n/Cr": 0.01},
      "D_Dun": {"nd1/nd1": 0.15, "nd1/nd2": 0.25, "nd2/nd2": 0.6},
      "Z_Silver": {"n/n": 1.0},
      "Ch_Champagne": {"n/n": 1.0},
      "G_Gray": {"g/g": 0.6, "G/g": 0.3, "G/G": 0.1},
      "Rn_Roan": {"rn/rn": 1.0},
      "W_DominantWhite": {"w/w": 0.99, "W20/w": 0.01},
      "TO_Tobiano": {"to/to": 1.0},
      "O_FrameOvero": {"n/n": 1.0},
      "SB1_Sabino1": {"n/n": 1.0},
      "SW_SplashWhite": {"n/n": 1.0},
      "LP_LeopardComplex": {"lp/lp": 1.0},
      "PATN1_Pattern1": {"patn1/patn1": 1.0},
      "EDXW": {"n/n": 1.0},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 0.98, "N/Prl": 0.015, "Prl/Prl": 0.005, "Cr/Prl": 0.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.3, "star": 0.3, "strip": 0.2, "blaze": 0.1, "snip": 0.1},
      "legs_general_probability": 0.4,
      "leg_specific_probabilities": {
        "coronet": 0.4, "pastern": 0.3, "sock": 0.2, "stocking": 0.1
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.05,
      "pangare": 0.01,
      "rabicano": 0.02
    },
    "shade_bias": {
      "Chestnut": {"light": 0.2, "medium": 0.5, "dark": 0.3},
      "Bay": {"light": 0.3, "standard": 0.5, "dark": 0.2},
      "Black": {"standard": 1.0},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.2},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Bay Pearl": {"apricot": 0.4, "dark brown points": 0.6},
      "Chestnut Pearl": {"light pink-apricot": 1.0},
      "Black Pearl": {"light tan": 0.4, "dark points": 0.6},
      "Buckskin Pearl": {"light apricot": 0.4, "reddish-brown points": 0.6},
      "Palomino Pearl": {"pale apricot": 0.5, "pale mane": 0.5},
      "Smoky Black Pearl": {"pale tan": 0.4, "dark points": 0.6}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.0,
      "snowflake_probability_multiplier": 0.0,
      "frost_probability_multiplier": 0.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  -- Insert American Quarter Horse
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('American Quarter Horse', 'Western', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n", "Z/Z"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to", "TO/to", "TO/TO"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n"],
      "LP_LeopardComplex": ["lp/lp", "LP/lp", "LP/LP"],
      "PATN1_Pattern1": ["patn1/patn1", "PATN1/patn1", "PATN1/PATN1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N", "N/Prl", "Prl/Prl", "Cr/Prl"],
      "BR1_Brindle1": ["N/N", "N/BR1", "BR1/BR1", "BR1/Y"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W20/W20"],
      "SW_SplashWhite": ["SW3/SW3"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
      "A_Agouti": {"a/a": 0.25, "A/a": 0.5, "A/A": 0.25},
      "Cr_Cream": {"n/n": 0.8, "n/Cr": 0.15, "Cr/Cr": 0.05},
      "D_Dun": {"D/D": 0.05, "D/nd1": 0.1, "D/nd2": 0.1, "nd1/nd1": 0.25, "nd1/nd2": 0.25, "nd2/nd2": 0.25},
      "Z_Silver": {"n/n": 0.98, "Z/n": 0.015, "Z/Z": 0.005},
      "Ch_Champagne": {"n/n": 0.98, "Ch/n": 0.015, "Ch/Ch": 0.005},
      "G_Gray": {"g/g": 0.85, "G/g": 0.1, "G/G": 0.05},
      "Rn_Roan": {"rn/rn": 0.8, "Rn/rn": 0.15, "Rn/Rn": 0.05},
      "W_DominantWhite": {"w/w": 0.98, "W20/w": 0.02},
      "TO_Tobiano": {"to/to": 0.7, "TO/to": 0.25, "TO/TO": 0.05},
      "O_FrameOvero": {"n/n": 0.95, "O/n": 0.05},
      "SB1_Sabino1": {"n/n": 0.9, "SB1/n": 0.1},
      "SW_SplashWhite": {"n/n": 0.95, "SW1/n": 0.03, "SW2/n": 0.01, "SW3/n": 0.01},
      "LP_LeopardComplex": {"lp/lp": 0.95, "LP/lp": 0.04, "LP/LP": 0.01},
      "PATN1_Pattern1": {"patn1/patn1": 0.95, "PATN1/patn1": 0.04, "PATN1/PATN1": 0.01},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 0.99, "N/Prl": 0.007, "Prl/Prl": 0.003, "Cr/Prl": 0.0},
      "BR1_Brindle1": {"N/N": 0.999, "N/BR1": 0.0009, "BR1/BR1": 0.0001, "BR1/Y": 0.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.3, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.5,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.3,
      "flaxen": 0.1,
      "pangare": 0.05,
      "rabicano": 0.05
    },
    "shade_bias": {
      "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
      "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Black": {"standard": 0.5, "faded": 0.5},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
      "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
      "Grulla": {"silver gray": 0.3, "standard": 0.4, "burnished": 0.3},
      "Red Dun": {"strawberry": 0.4, "medium": 0.3, "dark red": 0.3},
      "Bay Dun": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Cremello": {"ice": 0.5, "peachy": 0.5},
      "Perlino": {"cream": 0.5, "peachy": 0.5},
      "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
      "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
      "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
      "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
      "Silver Black": {"steel": 0.5, "rich black": 0.5},
      "Silver Bay": {"light": 0.3, "brushed bronze": 0.4, "burnished": 0.3},
      "Blue Roan": {"steel": 0.4, "cool gray": 0.4, "charcoal": 0.2},
      "Red Roan": {"rose": 0.5, "cherry": 0.3, "rust": 0.2},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Fewspot Leopard": {"porcelain": 0.6, "frosted": 0.4},
      "Snowcap": {"cream": 0.4, "porcelain": 0.4, "ivory": 0.2},
      "Leopard": {"light spotted": 0.4, "freckled": 0.4, "bold spotted": 0.2},
      "Blanket": {"light blanket": 0.4, "mottled blanket": 0.4, "spotted blanket": 0.2},
      "Varnish Roan": {"roan wash": 0.4, "peppered": 0.4, "faded": 0.2},
      "Bay Pearl": {"apricot": 0.4, "dark brown points": 0.6},
      "Chestnut Pearl": {"light pink-apricot": 1.0},
      "Black Pearl": {"light tan": 0.4, "dark points": 0.6},
      "Buckskin Pearl": {"light apricot": 0.4, "reddish-brown points": 0.6},
      "Palomino Pearl": {"pale apricot": 0.5, "pale mane": 0.5},
      "Smoky Black Pearl": {"pale tan": 0.4, "dark points": 0.6},
      "Brindle (Female)": {"vertical stripes": 0.7, "altered texture": 0.3},
      "Sparse Mane/Tail": {"sparse mane/tail": 1.0}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.5,
      "snowflake_probability_multiplier": 1.0,
      "frost_probability_multiplier": 1.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

    -- Insert Walkaloosa
  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
  ('Walkaloosa', 'Gaited or Western', $json${
    "allowed_alleles": {
      "E_Extension": ["e/e", "E/e", "E/E"],
      "A_Agouti": ["a/a", "A/a", "A/A"],
      "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
      "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
      "Z_Silver": ["n/n", "Z/n", "Z/Z"],
      "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
      "G_Gray": ["g/g", "G/g", "G/G"],
      "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
      "W_DominantWhite": ["w/w", "W20/w"],
      "TO_Tobiano": ["to/to", "TO/to", "TO/TO"],
      "O_FrameOvero": ["n/n", "O/n"],
      "SB1_Sabino1": ["n/n", "SB1/n"],
      "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n"],
      "LP_LeopardComplex": ["lp/lp", "LP/lp", "LP/LP"],
      "PATN1_Pattern1": ["patn1/patn1", "PATN1/patn1", "PATN1/PATN1"],
      "EDXW": ["n/n", "EDXW1/n", "EDXW2/n", "EDXW3/n"],
      "MFSD12_Mushroom": ["N/N"],
      "Prl_Pearl": ["N/N"],
      "BR1_Brindle1": ["N/N"]
    },
    "disallowed_combinations": {
      "O_FrameOvero": ["O/O"],
      "W_DominantWhite": ["W20/W20"],
      "SW_SplashWhite": ["SW3/SW3"]
    },
    "allele_weights": {
      "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
      "A_Agouti": {"a/a": 0.25, "A/a": 0.5, "A/A": 0.25},
      "Cr_Cream": {"n/n": 0.95, "n/Cr": 0.04, "Cr/Cr": 0.01},
      "D_Dun": {"D/D": 0.02, "D/nd1": 0.05, "D/nd2": 0.05, "nd1/nd1": 0.26, "nd1/nd2": 0.26, "nd2/nd2": 0.36},
      "Z_Silver": {"n/n": 0.99, "Z/n": 0.007, "Z/Z": 0.003},
      "Ch_Champagne": {"n/n": 0.99, "Ch/n": 0.009, "Ch/Ch": 0.001},
      "G_Gray": {"g/g": 0.85, "G/g": 0.1, "G/G": 0.05},
      "Rn_Roan": {"rn/rn": 0.8, "Rn/rn": 0.15, "Rn/Rn": 0.05},
      "W_DominantWhite": {"w/w": 0.98, "W20/w": 0.02},
      "TO_Tobiano": {"to/to": 0.75, "TO/to": 0.2, "TO/TO": 0.05},
      "O_FrameOvero": {"n/n": 0.99, "O/n": 0.01},
      "SB1_Sabino1": {"n/n": 0.9, "SB1/n": 0.1},
      "SW_SplashWhite": {"n/n": 0.96, "SW1/n": 0.02, "SW2/n": 0.01, "SW3/n": 0.01},
      "LP_LeopardComplex": {"lp/lp": 0.4, "LP/lp": 0.5, "LP/LP": 0.1},
      "PATN1_Pattern1": {"patn1/patn1": 0.4, "PATN1/patn1": 0.5, "PATN1/PATN1": 0.1},
      "EDXW": {"n/n": 0.97, "EDXW1/n": 0.01, "EDXW2/n": 0.01, "EDXW3/n": 0.01},
      "MFSD12_Mushroom": {"N/N": 1.0},
      "Prl_Pearl": {"N/N": 1.0},
      "BR1_Brindle1": {"N/N": 1.0}
    },
    "marking_bias": {
      "face": {"none": 0.2, "star": 0.3, "strip": 0.2, "blaze": 0.2, "snip": 0.1},
      "legs_general_probability": 0.6,
      "leg_specific_probabilities": {
        "coronet": 0.25, "pastern": 0.25, "sock": 0.25, "stocking": 0.25
      },
      "max_legs_marked": 4
    },
    "boolean_modifiers_prevalence": {
      "sooty": 0.2,
      "flaxen": 0.1,
      "pangare": 0.05,
      "rabicano": 0.05
    },
    "shade_bias": {
      "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
      "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Black": {"standard": 0.5, "faded": 0.5},
      "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
      "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
      "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
      "Grulla": {"silver gray": 0.3, "standard": 0.4, "burnished": 0.3},
      "Red Dun": {"strawberry": 0.4, "medium": 0.3, "dark red": 0.3},
      "Bay Dun": {"light": 0.3, "standard": 0.4, "dark": 0.3},
      "Cremello": {"ice": 0.5, "peachy": 0.5},
      "Perlino": {"cream": 0.5, "peachy": 0.5},
      "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
      "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
      "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
      "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
      "Silver Black": {"steel": 0.5, "rich black": 0.5},
      "Silver Bay": {"light": 0.3, "brushed bronze": 0.4, "burnished": 0.3},
      "Blue Roan": {"steel": 0.4, "cool gray": 0.4, "charcoal": 0.2},
      "Red Roan": {"rose": 0.5, "cherry": 0.3, "rust": 0.2},
      "Dominant White": {"white": 1.0},
      "Steel Gray": {"steel": 1.0},
      "Rose Gray": {"rose": 1.0},
      "Steel Dark Dapple Gray": {"steel dapple": 1.0},
      "Rose Dark Dapple Gray": {"rose dapple": 1.0},
      "Steel Light Dapple Gray": {"light steel dapple": 1.0},
      "Rose Light Dapple Gray": {"light rose dapple": 1.0},
      "White Gray": {"white gray": 1.0},
      "Fleabitten Gray": {"fleabitten": 1.0},
      "Fewspot Leopard": {"porcelain": 0.6, "frosted": 0.4},
      "Snowcap": {"cream": 0.4, "porcelain": 0.4, "ivory": 0.2},
      "Leopard": {"light spotted": 0.4, "freckled": 0.4, "bold spotted": 0.2},
      "Blanket": {"light blanket": 0.4, "mottled blanket": 0.4, "spotted blanket": 0.2},
      "Varnish Roan": {"roan wash": 0.4, "peppered": 0.4, "faded": 0.2},
      "Light Snowflake Leopard": {"light snowflake": 1.0},
      "Moderate Snowflake Leopard": {"moderate snowflake": 1.0},
      "Heavy Snowflake Leopard": {"heavy snowflake": 1.0},
      "Light Frost Roan Varnish": {"light frost": 1.0},
      "Moderate Frost Roan Varnish": {"moderate frost": 1.0},
      "Heavy Frost Roan Varnish": {"heavy frost": 1.0}
    },
    "advanced_markings_bias": {
      "bloody_shoulder_probability_multiplier": 1.5,
      "snowflake_probability_multiplier": 1.0,
      "frost_probability_multiplier": 1.0
    }
  }$json$::JSONB)
  ON CONFLICT (name) DO UPDATE SET
    default_trait = EXCLUDED.default_trait,
    breed_genetic_profile = EXCLUDED.breed_genetic_profile,
    updated_at = NOW();

  INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
('Lusitano', 'Dressage', $json${
  "allowed_alleles": {
    "E_Extension": ["e/e", "E/e", "E/E"],
    "A_Agouti": ["a/a", "A/a", "A/A"],
    "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
    "D_Dun": ["nd1/nd1", "nd1/nd2", "nd2/nd2"],
    "Z_Silver": ["n/n"],
    "Ch_Champagne": ["n/n"],
    "G_Gray": ["g/g", "G/g", "G/G"],
    "Rn_Roan": ["rn/rn"],
    "W_DominantWhite": ["w/w", "W1/w", "W2/w", "W3/w", "W4/w", "W5/w"],
    "TO_Tobiano": ["to/to"],
    "O_FrameOvero": ["n/n"],
    "SB1_Sabino1": ["n/n"],
    "SW_SplashWhite": ["n/n"],
    "LP_LeopardComplex": ["lp/lp"],
    "PATN1_Pattern1": ["patn1/patn1"],
    "EDXW": ["n/n"],
    "MFSD12_Mushroom": ["N/N"],
    "Prl_Pearl": ["N/N", "N/Prl", "Prl/Prl", "Cr/Prl"],
    "BR1_Brindle1": ["N/N"]
  },
  "disallowed_combinations": {
    "O_FrameOvero": ["O/O"],
    "W_DominantWhite": ["W1/W1", "W2/W2", "W3/W3", "W4/W4", "W5/W5"]
  },
  "allele_weights": {
    "E_Extension": {"e/e": 0.1, "E/e": 0.5, "E/E": 0.4},
    "A_Agouti": {"a/a": 0.2, "A/a": 0.5, "A/A": 0.3},
    "Cr_Cream": {"n/n": 0.97, "n/Cr": 0.02, "Cr/Cr": 0.01},
    "D_Dun": {"nd1/nd1": 0.05, "nd1/nd2": 0.01, "nd2/nd2": 0.94},
    "Z_Silver": {"n/n": 1.0},
    "Ch_Champagne": {"n/n": 1.0},
    "G_Gray": {"g/g": 0.41, "G/g": 0.55, "G/G": 0.04},
    "Rn_Roan": {"rn/rn": 1.0},
    "W_DominantWhite": {
      "w/w": 0.99,
      "W1/w": 0.002,
      "W2/w": 0.002,
      "W3/w": 0.002,
      "W4/w": 0.002,
      "W5/w": 0.002
    },
    "TO_Tobiano": {"to/to": 1.0},
    "O_FrameOvero": {"n/n": 1.0},
    "SB1_Sabino1": {"n/n": 1.0},
    "SW_SplashWhite": {"n/n": 1.0},
    "LP_LeopardComplex": {"lp/lp": 1.0},
    "PATN1_Pattern1": {"patn1/patn1": 1.0},
    "EDXW": {"n/n": 1.0},
    "MFSD12_Mushroom": {"N/N": 1.0},
    "Prl_Pearl": {"N/N": 0.975, "N/Prl": 0.015, "Prl/Prl": 0.01, "Cr/Prl": 0.0},
    "BR1_Brindle1": {"N/N": 1.0}
  },
  "marking_bias": {
    "face": {"none": 0.4, "star": 0.3, "strip": 0.15, "snip": 0.1, "blaze": 0.05},
    "legs_general_probability": 0.3,
    "leg_specific_probabilities": {
      "coronet": 0.4,
      "pastern": 0.3,
      "sock": 0.2,
      "stocking": 0.1
    },
    "max_legs_marked": 2
  },
  "boolean_modifiers_prevalence": {
    "sooty": 0.4,
    "flaxen": 0.05,
    "pangare": 0.2,
    "rabicano": 0.05
  },
  "shade_bias": {
    "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
    "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
    "Black": {"standard": 0.5, "faded": 0.5},
    "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
    "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
    "Cremello": {"ice": 0.5, "peachy": 0.5},
    "Perlino": {"cream": 0.5, "peachy": 0.5},
    "Steel Gray": {"steel": 1.0},
    "Rose Gray": {"rose": 1.0},
    "Steel Dark Dapple Gray": {"steel dapple": 1.0},
    "Rose Dark Dapple Gray": {"rose dapple": 1.0},
    "Steel Light Dapple Gray": {"light steel dapple": 1.0},
    "Rose Light Dapple Gray": {"light rose dapple": 1.0},
    "White Gray": {"white gray": 1.0},
    "Fleabitten Gray": {"fleabitten": 1.0}
  },
  "advanced_markings_bias": {
    "bloody_shoulder_probability_multiplier": 1.5,
    "snowflake_probability_multiplier": 0.0,
    "frost_probability_multiplier": 0.0
  }
}$json$::JSONB)
ON CONFLICT (name) DO UPDATE SET
  default_trait = EXCLUDED.default_trait,
  breed_genetic_profile = EXCLUDED.breed_genetic_profile,
  updated_at = NOW();

  -- Paint Horse (ID 12): Distinctive white spotting patterns (tobiano, overo, tovero)
INSERT INTO breeds (name, default_trait, breed_genetic_profile) VALUES
('Paint Horse', 'Western', $json${
  "allowed_alleles": {
    "E_Extension": ["e/e", "E/e", "E/E"],
    "A_Agouti": ["a/a", "A/a", "A/A"],
    "Cr_Cream": ["n/n", "n/Cr", "Cr/Cr"],
    "D_Dun": ["D/D", "D/nd1", "D/nd2", "nd1/nd1", "nd1/nd2", "nd2/nd2"],
    "Z_Silver": ["n/n", "Z/n"],
    "Ch_Champagne": ["n/n", "Ch/n", "Ch/Ch"],
    "G_Gray": ["g/g", "G/g", "G/G"],
    "Rn_Roan": ["rn/rn", "Rn/rn", "Rn/Rn"],
    "W_DominantWhite": ["w/w", "W5/w", "W10/w", "W20/w"],
    "TO_Tobiano": ["to/to", "TO/to", "TO/TO"],
    "O_FrameOvero": ["n/n", "O/n"],
    "SB1_Sabino1": ["n/n", "SB1/n"],
    "SW_SplashWhite": ["n/n", "SW1/n", "SW2/n", "SW3/n"],
    "LP_LeopardComplex": ["lp/lp"],
    "PATN1_Pattern1": ["patn1/patn1"],
    "EDXW": ["n/n"],
    "MFSD12_Mushroom": ["N/N"],
    "Prl_Pearl": ["N/N", "N/Prl", "Prl/Prl"],
    "BR1_Brindle1": ["N/N", "N/BR1", "BR1/BR1"]
  },
  "disallowed_combinations": {
    "O_FrameOvero": ["O/O"],
    "W_DominantWhite": ["W5/W5", "W10/W10", "W20/W20"],
    "SW_SplashWhite": ["SW3/SW3"]
  },
  "allele_weights": {
    "E_Extension": {"e/e": 0.3, "E/e": 0.5, "E/E": 0.2},
    "A_Agouti": {"a/a": 0.2, "A/a": 0.5, "A/A": 0.3},
    "Cr_Cream": {"n/n": 0.95, "n/Cr": 0.045, "Cr/Cr": 0.005},
    "D_Dun": {"D/D": 0.002, "D/nd1": 0.003, "D/nd2": 0.005, "nd1/nd1": 0.005, "nd1/nd2": 0.005, "nd2/nd2": 0.98},
    "Z_Silver": {"n/n": 0.995, "Z/n": 0.005},
    "Ch_Champagne": {"n/n": 0.99, "Ch/n": 0.009, "Ch/Ch": 0.001},
    "G_Gray": {"g/g": 0.95, "G/g": 0.045, "G/G": 0.005},
    "Rn_Roan": {"rn/rn": 0.95, "Rn/rn": 0.045, "Rn/Rn": 0.005},
    "W_DominantWhite": {"w/w": 0.995, "W5/w": 0.002, "W10/w": 0.002, "W20/w": 0.001},
    "TO_Tobiano": {"to/to": 0.6, "TO/to": 0.35, "TO/TO": 0.05},
    "O_FrameOvero": {"n/n": 0.8, "O/n": 0.2},
    "SB1_Sabino1": {"n/n": 0.85, "SB1/n": 0.15},
    "SW_SplashWhite": {"n/n": 0.95, "SW1/n": 0.03, "SW2/n": 0.01, "SW3/n": 0.01},
    "LP_LeopardComplex": {"lp/lp": 1.0},
    "PATN1_Pattern1": {"patn1/patn1": 1.0},
    "EDXW": {"n/n": 1.0},
    "MFSD12_Mushroom": {"N/N": 1.0},
    "Prl_Pearl": {"N/N": 0.995, "N/Prl": 0.004, "Prl/Prl": 0.001},
    "BR1_Brindle1": {"N/N": 0.999, "N/BR1": 0.0009, "BR1/BR1": 0.0001}
  },
  "marking_bias": {
    "face": {"none": 0.1, "star": 0.2, "strip": 0.2, "blaze": 0.3, "snip": 0.2},
    "legs_general_probability": 0.7,
    "leg_specific_probabilities": {
      "coronet": 0.1, "pastern": 0.2, "sock": 0.3, "stocking": 0.3
    },
    "max_legs_marked": 4
  },
  "boolean_modifiers_prevalence": {
    "sooty": 0.3,
    "flaxen": 0.1,
    "pangare": 0.1,
    "rabicano": 0.05
  },
  "shade_bias": {
    "Chestnut": {"light": 0.3, "medium": 0.4, "dark": 0.3},
    "Bay": {"light": 0.3, "standard": 0.4, "dark": 0.3},
    "Black": {"standard": 0.5, "faded": 0.5},
    "Palomino": {"pale": 0.3, "golden": 0.4, "copper": 0.3},
    "Buckskin": {"cream": 0.3, "golden": 0.4, "burnished": 0.3},
    "Smoky Black": {"faded": 0.5, "rich chocolate": 0.5},
    "Grulla": {"silver gray": 0.3, "standard": 0.4, "burnished": 0.3},
    "Red Dun": {"strawberry": 0.4, "medium": 0.3, "dark red": 0.3},
    "Bay Dun": {"light": 0.3, "standard": 0.4, "dark": 0.3},
    "Cremello": {"ice": 0.5, "peachy": 0.5},
    "Perlino": {"cream": 0.5, "peachy": 0.5},
    "Smoky Cream": {"light cream": 0.5, "dark cream": 0.5},
    "Gold Champagne": {"pale": 0.3, "golden": 0.4, "dark": 0.3},
    "Amber Champagne": {"light": 0.3, "medium": 0.4, "deep": 0.3},
    "Classic Champagne": {"faded": 0.3, "standard": 0.4, "rich": 0.3},
    "Gold Cream Champagne": {"pale": 0.3, "golden": 0.4, "burnished": 0.3},
    "Amber Cream Champagne": {"light": 0.3, "rich": 0.4, "dark": 0.3},
    "Classic Cream Champagne": {"light": 0.3, "silver": 0.4, "charcoal": 0.3},
    "Gold Dun Champagne": {"light": 0.3, "golden": 0.4, "red": 0.3},
    "Amber Dun Champagne": {"light": 0.3, "tan": 0.4, "burnished": 0.3},
    "Classic Dun Champagne": {"cool gray": 0.3, "iron": 0.4, "smoky": 0.3},
    "Gold Cream Dun Champagne": {"pale": 0.3, "golden": 0.4, "burnished": 0.3},
    "Amber Cream Dun Champagne": {"light": 0.3, "rich": 0.4, "dark": 0.3},
    "Classic Cream Dun Champagne": {"light gray": 0.3, "slate": 0.4, "charcoal": 0.3},
    "Silver Classic Champagne": {"light": 0.3, "silvery": 0.4, "dark": 0.3},
    "Silver Amber Dun Champagne": {"silver": 0.3, "tan": 0.4, "smoky": 0.3},
    "Silver Grulla": {"icy": 0.3, "gunmetal": 0.4, "shadow": 0.3},
    "Silver Buckskin": {"frosted": 0.3, "golden": 0.4, "burnished": 0.3},
    "Silver Bay": {"light": 0.3, "brushed bronze": 0.4, "burnished": 0.3},
    "Silver Black": {"steel": 0.5, "rich black": 0.5},
    "Silver Amber Cream Dun Champagne": {"frosted gold": 0.3, "silver tan": 0.4, "shadowed bronze": 0.3},
    "Blue Roan": {"steel": 0.4, "cool gray": 0.4, "charcoal": 0.2},
    "Red Roan": {"rose": 0.5, "cherry": 0.3, "rust": 0.2},
    "Strawberry Roan": {"pinkish": 0.4, "amber": 0.4, "wine": 0.2},
    "Dominant White": {"white": 1.0},
    "Steel Gray": {"steel": 1.0},
    "Rose Gray": {"rose": 1.0},
    "Steel Dark Dapple Gray": {"steel dapple": 1.0},
    "Rose Dark Dapple Gray": {"rose dapple": 1.0},
    "Steel Light Dapple Gray": {"light steel dapple": 1.0},
    "Rose Light Dapple Gray": {"light rose dapple": 1.0},
    "White Gray": {"white gray": 1.0},
    "Fleabitten Gray": {"fleabitten": 1.0},
    "Bay Pearl": {"apricot": 0.4, "dark brown points": 0.6},
    "Chestnut Pearl": {"light pink-apricot": 1.0},
    "Black Pearl": {"light tan": 0.4, "dark points": 0.6},
    "Buckskin Pearl": {"light apricot": 0.4, "reddish-brown points": 0.6},
    "Palomino Pearl": {"pale apricot": 0.5, "pale mane": 0.5},
    "Smoky Black Pearl": {"pale tan": 0.4, "dark points": 0.6},
    "Brindle (Female)": {"vertical stripes": 0.7, "altered texture": 0.3},
    "Sparse Mane/Tail": {"sparse mane/tail": 1.0}
  },
  "advanced_markings_bias": {
    "bloody_shoulder_probability_multiplier": 1.5,
    "snowflake_probability_multiplier": 0.0,
    "frost_probability_multiplier": 0.0
  }
}$json$::JSONB)
ON CONFLICT (name) DO UPDATE SET
  default_trait = EXCLUDED.default_trait,
  breed_genetic_profile = EXCLUDED.breed_genetic_profile,
  updated_at = NOW();

END $$;

-- Seed Crossbreed Rules Table
-- Ensure the CHECK constraint (breed1_id < breed2_id) is respected

-- Remove existing rules for National Show Horse to ensure a clean slate
DELETE FROM crossbreed_rules WHERE offspring_breed_id = (SELECT id FROM breeds WHERE name = 'National Show Horse');

-- Insert rule for Arabian x American Saddlebred -> National Show Horse
INSERT INTO crossbreed_rules (breed1_id, breed2_id, offspring_breed_id, notes)
SELECT
    LEAST((SELECT id FROM breeds WHERE name = 'Arabian'), (SELECT id FROM breeds WHERE name = 'American Saddlebred')) AS breed1_id,
    GREATEST((SELECT id FROM breeds WHERE name = 'Arabian'), (SELECT id FROM breeds WHERE name = 'American Saddlebred')) AS breed2_id,
    (SELECT id FROM breeds WHERE name = 'National Show Horse') AS offspring_breed_id,
    'Arabian x American Saddlebred produces National Show Horse. Trait inheritance typically 50/50 or can be specified.'
WHERE
    EXISTS (SELECT 1 FROM breeds WHERE name = 'Arabian') AND
    EXISTS (SELECT 1 FROM breeds WHERE name = 'American Saddlebred') AND
    EXISTS (SELECT 1 FROM breeds WHERE name = 'National Show Horse')
ON CONFLICT (breed1_id, breed2_id) DO NOTHING;