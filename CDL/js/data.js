/* global QUESTIONS */
'use strict';

/**
 * CDL Study Tool — Question Bank
 * Domains:
 *   general       — General Knowledge
 *   air_brakes    — Air Brakes
 *   combination   — Combination Vehicles
 *   hazmat        — Hazardous Materials
 *   pre_trip      — Pre-Trip Inspection
 *   special       — Special Situations & Regulations
 */

const DOMAINS = {
  general:     { label: 'General Knowledge',        color: '#2563EB' },
  air_brakes:  { label: 'Air Brakes',               color: '#DC2626' },
  combination: { label: 'Combination Vehicles',     color: '#059669' },
  hazmat:      { label: 'Hazardous Materials',      color: '#D97706' },
  pre_trip:    { label: 'Pre-Trip Inspection',      color: '#7C3AED' },
  special:     { label: 'Special Situations',       color: '#0891B2' },
};

const QUESTIONS = [
  // ─── GENERAL KNOWLEDGE ──────────────────────────────────────────────────
  {
    id: 1, domain: 'general',
    q: 'What is the most critical driving skill for a CDL driver?',
    options: ['Speed management', 'Space management', 'Radio operation', 'Fuel efficiency'],
    answer: 1,
    rationale: 'Space management is the foundation of safe commercial driving — maintaining proper following distance and buffer space prevents most collisions.'
  },
  {
    id: 2, domain: 'general',
    q: 'How far ahead should you look when driving on the highway?',
    options: ['3–4 seconds', '5–6 seconds', '12–15 seconds', '20–25 seconds'],
    answer: 2,
    rationale: 'At highway speeds, you should scan 12–15 seconds ahead (about 1/4 mile) to give yourself adequate response time.'
  },
  {
    id: 3, domain: 'general',
    q: 'When should you downshift before a long steep downgrade?',
    options: ['At the top of the grade', 'Halfway down', 'At the bottom of the grade', 'Downshifting is not recommended'],
    answer: 0,
    rationale: 'Downshift BEFORE starting down a steep grade so the engine can provide braking and you are in the correct gear throughout the descent.'
  },
  {
    id: 4, domain: 'general',
    q: 'What is the minimum tread depth required for front tires on a commercial vehicle?',
    options: ['2/32 inch', '4/32 inch', '6/32 inch', '8/32 inch'],
    answer: 1,
    rationale: 'Front tires must have at least 4/32-inch tread depth for safe steering and control.'
  },
  {
    id: 5, domain: 'general',
    q: 'Which of the following is NOT a sign of tire failure while driving?',
    options: ['Steering feels heavy', 'Vehicle pulling to one side', 'Loud bang and vibration', 'Improved fuel economy'],
    answer: 3,
    rationale: 'Improved fuel economy is not associated with tire failure; the others are all warning signs of a blowout or flat.'
  },
  {
    id: 6, domain: 'general',
    q: 'How many hours may a property-carrying CDL driver drive after coming on duty?',
    options: ['8 hours', '10 hours', '11 hours', '14 hours'],
    answer: 2,
    rationale: 'Under the FMCSA 11-Hour Rule, a property-carrying driver may drive a maximum of 11 hours after 10 consecutive hours off duty.'
  },
  {
    id: 7, domain: 'general',
    q: 'A driver who has been on duty 60 hours in the last 7 days must take a break of at least:',
    options: ['8 consecutive hours', '10 consecutive hours', '24 consecutive hours', '34 consecutive hours'],
    answer: 3,
    rationale: 'The 60-hour/7-day rule requires 34 consecutive hours off to reset the weekly clock.'
  },
  {
    id: 8, domain: 'general',
    q: 'What is the correct following distance for a CMV traveling at 40 mph in good conditions?',
    options: ['2 seconds', '3 seconds', '4 seconds', '1 second per 10 feet of vehicle length'],
    answer: 3,
    rationale: 'The CDL manual requires one second for every 10 feet of vehicle length at speeds below 40 mph, plus one additional second over 40 mph.'
  },
  {
    id: 9, domain: 'general',
    q: 'When loading cargo, weight should be distributed:',
    options: ['As high as possible', 'All toward the rear axle', 'Low and evenly side to side', 'All toward the front axle'],
    answer: 2,
    rationale: 'Keeping cargo low and balanced side to side lowers the center of gravity and prevents rollovers.'
  },
  {
    id: 10, domain: 'general',
    q: 'What is the maximum blood alcohol concentration (BAC) allowed for CDL drivers while operating a CMV?',
    options: ['0.08%', '0.04%', '0.02%', '0.00%'],
    answer: 1,
    rationale: 'Federal law sets the legal BAC limit for CDL drivers at 0.04% while on duty — half the standard 0.08% limit.'
  },
  {
    id: 11, domain: 'general',
    q: 'When should you NOT use the trailer hand valve (trolley valve) to park?',
    options: ['On a flat surface', 'On a steep grade', 'Always — use parking brakes instead', 'In wet weather'],
    answer: 2,
    rationale: 'The trailer hand valve is not designed for parking; it can release accidentally. Always use the parking brakes to secure the vehicle.'
  },
  {
    id: 12, domain: 'general',
    q: 'During a severe rainstorm, you should:',
    options: ['Speed up to clear the rain faster', 'Turn on hazard lights and maintain speed', 'Slow down, increase following distance, and use headlights', 'Pull over immediately in any location'],
    answer: 2,
    rationale: 'Rain reduces visibility and traction; slow down, add following distance, and use headlights (not just hazards while moving in most states).'
  },
  {
    id: 13, domain: 'general',
    q: 'What does "gross combination weight rating" (GCWR) refer to?',
    options: ['Weight of cargo only', 'Total weight of a powered unit plus any trailers', 'Empty vehicle weight', 'Maximum payload capacity'],
    answer: 1,
    rationale: 'GCWR is the maximum total loaded weight of a truck-tractor plus any trailers it is designed to pull.'
  },
  {
    id: 14, domain: 'general',
    q: 'Which mirror should be checked most frequently while driving?',
    options: ['Left flat mirror', 'Right flat mirror', 'Both flat mirrors equally', 'Rear-view mirror only'],
    answer: 2,
    rationale: 'Both flat mirrors should be checked regularly (every 3–5 seconds) to monitor surrounding traffic and blind spots.'
  },
  {
    id: 15, domain: 'general',
    q: 'When driving in heavy fog, you should use:',
    options: ['High-beam headlights', 'Low-beam headlights', 'Hazard lights only', 'No lights — they reflect back'],
    answer: 1,
    rationale: 'Low beams (or fog lights where available) penetrate fog better than high beams, which reflect off the moisture and reduce visibility further.'
  },

  // ─── AIR BRAKES ──────────────────────────────────────────────────────────
  {
    id: 16, domain: 'air_brakes',
    q: 'The air compressor cuts out (stops pumping) when air pressure reaches approximately:',
    options: ['60–70 psi', '85–95 psi', '100–125 psi', '140–150 psi'],
    answer: 2,
    rationale: 'Most air brake systems are designed so the governor cuts out the compressor at 100–125 psi and cuts back in around 85–100 psi.'
  },
  {
    id: 17, domain: 'air_brakes',
    q: 'What does the low pressure warning signal activate at?',
    options: ['100 psi', '85 psi', '60 psi', '50 psi'],
    answer: 2,
    rationale: 'The low air pressure warning (light and/or buzzer) must activate before pressure drops below 60 psi.'
  },
  {
    id: 18, domain: 'air_brakes',
    q: 'Spring parking brakes automatically apply when air pressure falls below approximately:',
    options: ['90 psi', '60 psi', '45 psi', '20 psi'],
    answer: 2,
    rationale: 'Spring parking brakes apply automatically when system pressure drops to about 20–45 psi, depending on the manufacturer.'
  },
  {
    id: 19, domain: 'air_brakes',
    q: 'In a static (parked) air brake test, leakage should not exceed:',
    options: ['1 psi per minute (single vehicle)', '2 psi per minute (single vehicle)', '3 psi per minute (single vehicle)', '5 psi per minute (single vehicle)'],
    answer: 2,
    rationale: 'A single vehicle should lose no more than 3 psi per minute; combination vehicles no more than 4 psi per minute with brakes applied.'
  },
  {
    id: 20, domain: 'air_brakes',
    q: 'What is brake fade?',
    options: ['Brakes wearing thin', 'Loss of braking power due to heat', 'Air line rupture', 'Slack adjuster failure'],
    answer: 1,
    rationale: 'Brake fade occurs when drum brakes overheat, causing reduced friction and loss of braking effectiveness. It is a primary danger on long downgrades.'
  },
  {
    id: 21, domain: 'air_brakes',
    q: 'The brake pedal in an air brake system is technically called:',
    options: ['The service brake pedal', 'The foot valve (treadle valve)', 'The quick release valve', 'The relay valve'],
    answer: 1,
    rationale: 'The brake pedal in an air system controls a foot valve (also called treadle valve) that regulates air pressure to the brake chambers.'
  },
  {
    id: 22, domain: 'air_brakes',
    q: 'What should you drain from the air tanks daily?',
    options: ['Brake fluid', 'Oil and water condensation', 'Coolant', 'Transmission fluid'],
    answer: 1,
    rationale: 'Air tanks accumulate oil and water condensation. Draining them daily prevents corrosion and ensures brake reliability. Many modern systems have automatic drain valves.'
  },
  {
    id: 23, domain: 'air_brakes',
    q: 'Controlled braking (also called stab braking) means:',
    options: ['Pressing the brake as hard as possible and holding', 'Applying brakes in a series of short firm strokes', 'Using only the engine brake', 'Releasing brakes entirely to steer first'],
    answer: 1,
    rationale: 'Stab braking applies full brakes until wheels are about to lock, then releases to allow steering, then reapplies. Controlled braking applies steady, maximum non-locking pressure.'
  },
  {
    id: 24, domain: 'air_brakes',
    q: 'A dual air brake system has two separate air circuits. What is the purpose?',
    options: ['More stopping power on front axle only', 'Redundancy — one circuit still works if the other fails', 'Allows driver to brake one side independently', 'Required for combination vehicles only'],
    answer: 1,
    rationale: 'A dual system provides redundancy: if one circuit fails, the other can still stop the vehicle, greatly improving safety.'
  },
  {
    id: 25, domain: 'air_brakes',
    q: 'Before driving, you should fan the brakes to test the low-pressure warning. The warning should come on before pressure falls below:',
    options: ['85 psi', '75 psi', '60 psi', '45 psi'],
    answer: 2,
    rationale: 'The warning light/buzzer must activate before pressure falls below 60 psi, giving the driver time to stop safely.'
  },
  {
    id: 26, domain: 'air_brakes',
    q: 'Slack adjusters measure how far the pushrod moves. What is the maximum allowable stroke for a typical service brake chamber?',
    options: ['1 inch', '2 inches', '3 inches', '4 inches'],
    answer: 1,
    rationale: 'Most brake chambers have a maximum pushrod stroke of about 2 inches; exceeding this indicates out-of-adjustment brakes that reduce stopping power.'
  },
  {
    id: 27, domain: 'air_brakes',
    q: 'When the yellow diamond-shaped light comes on in the cab, it indicates:',
    options: ['Low fuel', 'Trailer parking brake applied', 'Low air pressure warning', 'High beam headlights active'],
    answer: 2,
    rationale: 'A yellow warning lamp (often diamond or similar) signals low air pressure; stop safely and investigate the cause immediately.'
  },

  // ─── COMBINATION VEHICLES ─────────────────────────────────────────────────
  {
    id: 28, domain: 'combination',
    q: 'What is "trailer swing" (crack-the-whip) when backing a tractor-trailer?',
    options: ['The trailer sliding backwards due to grade', 'The trailer swinging wide as the tractor turns', 'The trailer jackknifing forward', 'None of the above'],
    answer: 1,
    rationale: 'When a tractor turns in reverse, the rear of the trailer swings in the opposite direction — the further back you sit, the more leverage and swing.'
  },
  {
    id: 29, domain: 'combination',
    q: 'What is the correct position of the fifth wheel jaws when a trailer is properly coupled?',
    options: ['Partially closed around the kingpin', 'Fully closed around the kingpin', 'Open — locked only by the safety latch', 'Closed on the trailer skid plate only'],
    answer: 1,
    rationale: 'The fifth wheel jaws must be fully closed and locked around the kingpin. A partially closed jaw is a failed coupling.'
  },
  {
    id: 30, domain: 'combination',
    q: 'What color is the emergency air line glad hand?',
    options: ['Blue', 'Red', 'Yellow', 'Green'],
    answer: 1,
    rationale: 'The emergency (supply) glad hand is red; the service (control) glad hand is blue. This color-coding prevents misconnection.'
  },
  {
    id: 31, domain: 'combination',
    q: 'A combination vehicle jackknifes when:',
    options: ['The trailer brakes lock before the tractor', 'The tractor slides and the trailer pushes it sideways', 'The tractor and trailer form an acute angle', 'All of the above can lead to a jackknife'],
    answer: 3,
    rationale: 'Jackknifing can result from brake imbalance (trailer or tractor skidding), excessive speed on curves, or sudden steering inputs — all fold the vehicle into a dangerous V shape.'
  },
  {
    id: 32, domain: 'combination',
    q: 'To prevent trailer sway when backing, you should:',
    options: ['Turn the steering wheel in the direction you want the trailer to go', 'Turn the steering wheel opposite the direction you want the trailer to go', 'Apply trailer hand valve before steering', 'Back only in a straight line'],
    answer: 1,
    rationale: 'To make the trailer go left, turn the wheel to the right (and vice versa) — the counterintuitive "opposite" rule of trailer backing.'
  },
  {
    id: 33, domain: 'combination',
    q: 'What does the trailer supply valve (tractor protection valve) protect?',
    options: ['The trailer from losing air if the tractor loses pressure', 'The tractor air system if the trailer develops a major leak', 'The king pin from separation', 'The fifth wheel from rust'],
    answer: 1,
    rationale: 'The tractor protection valve closes automatically if the trailer air supply falls dangerously low, preserving air in the tractor brakes.'
  },
  {
    id: 34, domain: 'combination',
    q: 'Before coupling, what should you always check?',
    options: ['That the trailer floor is clean', 'That the landing gear is fully raised', 'That the kingpin is undamaged and the area is clear', 'That the load is properly secured'],
    answer: 2,
    rationale: 'Inspect the kingpin, fifth wheel area, and the space under the trailer before coupling to ensure a safe, damage-free connection.'
  },
  {
    id: 35, domain: 'combination',
    q: 'Rearward amplification (crack-the-whip effect) is most dangerous with:',
    options: ['Single trailers', 'Doubles (B-trains)', 'Triples', 'Straight trucks'],
    answer: 2,
    rationale: 'Each additional trailer increases rearward amplification exponentially; triple trailers are the most susceptible to rollover from this effect.'
  },

  // ─── HAZARDOUS MATERIALS ──────────────────────────────────────────────────
  {
    id: 36, domain: 'hazmat',
    q: 'Which placard is required for a load of 1,001 lbs or more of explosives (Division 1.1)?',
    options: ['DANGEROUS placard', 'EXPLOSIVE 1.1 placard', 'FLAMMABLE placard', 'No placard required under 5,000 lbs'],
    answer: 1,
    rationale: 'Division 1.1 explosives require the EXPLOSIVE 1.1 placard regardless of quantity if the load exceeds 1,001 lbs.'
  },
  {
    id: 37, domain: 'hazmat',
    q: 'The shipping paper for hazmat must include all EXCEPT:',
    options: ['Proper shipping name', 'UN identification number', 'Hazard class and division', "Driver's license number"],
    answer: 3,
    rationale: "A driver's license number is not required on shipping papers. Required elements include the shipping name, ID number, hazard class, and packing group."
  },
  {
    id: 38, domain: 'hazmat',
    q: 'Where must the shipping papers be placed while driving?',
    options: ['In the trailer with the cargo', 'In a pouch on the right-side door or within reach on the seat', 'In the glove compartment', 'Taped to the dashboard'],
    answer: 1,
    rationale: 'Shipping papers must be within easy reach of the driver (door pouch or seating area) so emergency responders can immediately identify hazmat cargo.'
  },
  {
    id: 39, domain: 'hazmat',
    q: 'Which division of flammable liquids has the lowest flash point?',
    options: ['Division 3 — flash point above 141°F', 'Division 3 — flash point below 73°F', 'Division 2.1', 'Division 4.1'],
    answer: 1,
    rationale: 'Class 3 flammable liquids with flash points below 73°F are the most volatile and dangerous; higher-flash liquids like diesel are in a less hazardous sub-category.'
  },
  {
    id: 40, domain: 'hazmat',
    q: 'When transporting hazmat, you must stop before railroad crossings:',
    options: ['Only if carrying explosives', 'For all hazmat placarded loads', 'Only in Class A or B placard categories', 'Never — hazmat transport has railroad priority'],
    answer: 1,
    rationale: 'ALL placarded hazmat loads must stop at railroad crossings (15–50 feet from the nearest rail), regardless of the hazard class.'
  },
  {
    id: 41, domain: 'hazmat',
    q: 'Chlorine (Class 2.3 poison gas). You are required to have:',
    options: ['Self-contained breathing apparatus in the cab', 'A gas mask only', 'Eye protection only', 'No special equipment beyond placard'],
    answer: 0,
    rationale: 'Drivers transporting certain poison gases (like chlorine) must carry an approved SCBA on board the vehicle.'
  },
  {
    id: 42, domain: 'hazmat',
    q: 'The DANGEROUS placard may be used when:',
    options: ['Carrying any mixture of hazmat totaling 1,001 lbs or more', 'Two or more hazmat categories are present and total 1,001–4,999 lbs', 'Only for Class 3 materials', 'Carrying radioactive materials'],
    answer: 1,
    rationale: 'The DANGEROUS placard is allowed when multiple types of hazmat are loaded and combined gross weight is between 1,001 and 4,999 lbs and no specific placards are required.'
  },
  {
    id: 43, domain: 'hazmat',
    q: 'What does the four-digit number on a hazmat placard identify?',
    options: ['The carrier code', 'The UN/NA identification number for the specific material', 'The weight of the shipment', 'The driver certification number'],
    answer: 1,
    rationale: 'The four-digit UN/NA ID number allows emergency responders to look up the specific material in the ERG (Emergency Response Guidebook).'
  },

  // ─── PRE-TRIP INSPECTION ─────────────────────────────────────────────────
  {
    id: 44, domain: 'pre_trip',
    q: 'During the engine compartment check, you should look for all of the following EXCEPT:',
    options: ['Oil leaks under the vehicle', 'Frayed belts and hoses', 'Proper tire inflation', 'Coolant level above minimum'],
    answer: 2,
    rationale: 'Tire inflation is checked during the tire/wheel inspection, not the engine compartment check.'
  },
  {
    id: 45, domain: 'pre_trip',
    q: 'When inspecting the steering axle tires, the minimum tread depth required is:',
    options: ['1/32 inch', '2/32 inch', '4/32 inch', '6/32 inch'],
    answer: 2,
    rationale: 'Steering axle (front) tires must have at least 4/32-inch tread depth. Other tires require 2/32 inch minimum.'
  },
  {
    id: 46, domain: 'pre_trip',
    q: 'Which lights MUST be checked during the pre-trip exterior walk-around?',
    options: ['Headlights only', 'Headlights and taillights only', 'All exterior lights including clearance, marker, and brake lights', 'Only legally required lights'],
    answer: 2,
    rationale: 'All exterior lights must be checked: headlights, taillights, turn signals, brake lights, clearance lights, marker lights, and reflectors.'
  },
  {
    id: 47, domain: 'pre_trip',
    q: 'You discover one lug nut is missing from a wheel during pre-trip. You should:',
    options: ['Drive slowly to the nearest shop', 'Mark it and report at end of trip', 'Do not drive — tag the vehicle out of service', 'Add a lug nut from another wheel to balance it'],
    answer: 2,
    rationale: 'Missing lug nuts are an out-of-service condition. You must not drive the vehicle until the wheel is properly repaired.'
  },
  {
    id: 48, domain: 'pre_trip',
    q: 'What is the purpose of the 7-step air brake check?',
    options: ['To ensure the engine runs properly', 'To verify brakes work correctly and test for leaks and warning systems', 'To check tire pressure', 'To inspect lighting systems'],
    answer: 1,
    rationale: 'The 7-step air brake check verifies brake adjustment, tests the low-pressure warning, checks for excessive air loss, and confirms spring brakes work.'
  },
  {
    id: 49, domain: 'pre_trip',
    q: 'When checking the fifth wheel during a pre-trip of a combination vehicle, you should:',
    options: ['Visually inspect only from the cab', 'Tug test with the tractor only', 'Visually inspect and physically tug-test for secure coupling', 'Check only if load exceeds 20,000 lbs'],
    answer: 2,
    rationale: 'Both visual inspection (jaws fully locked, plate greased, no gap) and a tug test (try to pull forward with trailer brakes set) are required.'
  },
  {
    id: 50, domain: 'pre_trip',
    q: 'During the steering check, you should check for excessive free play. How much free play is too much for a power steering vehicle?',
    options: ['More than 1 inch', 'More than 2 inches', 'More than 3 inches', 'More than 4 inches'],
    answer: 0,
    rationale: 'Power steering should have no more than about 1 inch (some manuals say 2 inches) of free play at the wheel rim before the front wheels respond.'
  },
  {
    id: 51, domain: 'pre_trip',
    q: 'What does "GOAL" stand for in CDL driving?',
    options: ['Go Out And Look', 'Get Out And Look', 'Get Out And Listen', 'Go Out And Listen'],
    answer: 1,
    rationale: '"Get Out And Look" is the correct CDL term — always exit the vehicle and physically check your surroundings before backing.'
  },

  // ─── SPECIAL SITUATIONS ──────────────────────────────────────────────────
  {
    id: 52, domain: 'special',
    q: 'When crossing a railroad track, you should:',
    options: ['Speed up to clear the tracks quickly', 'Shift gears while on the tracks', 'Never change gears while on the tracks', 'Stop in the center of the tracks to look both ways'],
    answer: 2,
    rationale: 'Never stop on railroad tracks and never shift gears while crossing. If the gear is too low to complete the crossing, wait until a clear opening exists.'
  },
  {
    id: 53, domain: 'special',
    q: 'What is the correct action when driving through a flooded roadway?',
    options: ['Drive through at normal speed to push water aside', 'Test brakes immediately after passing through water', 'Avoid if possible; if unavoidable, drive slowly and test brakes after', 'Never drive through any standing water'],
    answer: 2,
    rationale: 'Avoid flooded roadways when possible. If you must cross shallow water, drive slowly to prevent hydroplaning and apply gentle brake pressure immediately after to dry the drums.'
  },
  {
    id: 54, domain: 'special',
    q: 'A commercial vehicle must stop at any drawbridge unless:',
    options: ['The height clearance sign shows clearance', 'A traffic officer is present', 'The bridge is controlled by a signal and the signal indicates proceed', 'The speed limit is above 45 mph'],
    answer: 2,
    rationale: 'CMVs must stop at drawbridges unless there is a traffic signal that shows green or an officer/attendant signals to go.'
  },
  {
    id: 55, domain: 'special',
    q: 'Mountain driving rule: when should you use engine braking on a downgrade?',
    options: ['Only when service brakes overheat', 'At all times on downgrades to supplement service brakes', 'Only when speed exceeds posted limit', 'Engine braking is not permitted in commercial vehicles'],
    answer: 1,
    rationale: 'Engine braking (retarders, exhaust brakes, or jake brakes) should be used continuously on downgrades to reduce heat buildup in service brakes.'
  },
  {
    id: 56, domain: 'special',
    q: 'When driving at night, you should reduce speed so you can stop within:',
    options: ['Your headlight range', 'Twice your headlight range', '300 feet regardless of speed', '500 feet regardless of speed'],
    answer: 0,
    rationale: 'Night driving rule: always be able to stop within the distance illuminated by your headlights — "overdriving" your headlights is illegal and dangerous.'
  },
  {
    id: 57, domain: 'special',
    q: 'Emergency equipment required on a commercial vehicle includes all EXCEPT:',
    options: ['Three red reflective triangles', 'A fire extinguisher (10 BC minimum)', 'Spare fuses', 'A first-aid kit'],
    answer: 3,
    rationale: 'Federal regulations require triangles, fire extinguisher, and spare fuses (or circuit breakers). A first-aid kit is recommended but not federally required for CMVs.'
  },
  {
    id: 58, domain: 'special',
    q: 'When placing reflective triangles after a breakdown, the first triangle should be placed:',
    options: ['100 feet behind the vehicle', '10 feet behind the vehicle', 'At the point approaching traffic to warn them first', '200 feet behind the vehicle'],
    answer: 2,
    rationale: 'Place the first triangle at the point of hazard on the traffic side while moving to set up the others — protecting approaching traffic first.'
  },
  {
    id: 59, domain: 'special',
    q: 'In hot weather, what should you periodically check on your tires?',
    options: ['Air pressure — it increases with heat', 'Tread wear only', 'Sidewall color', 'Nothing — heat has no effect on properly inflated tires'],
    answer: 0,
    rationale: 'Heat increases tire air pressure. Never bleed air from hot tires to reduce pressure — allow them to cool first. Check pressure when tires are cool.'
  },
  {
    id: 60, domain: 'special',
    q: 'An oncoming vehicle with blinding headlights at night — you should:',
    options: ['Flash your high beams to signal them', 'Look toward the right edge of the road', 'Close your eyes briefly', 'Speed up to pass them faster'],
    answer: 1,
    rationale: 'Shift your gaze to the right edge of the roadway to avoid blinding light while still maintaining your path of travel.'
  },
  {
    id: 61, domain: 'special',
    q: 'What is the main danger of liquid cargo surge in a tanker?',
    options: ['Cargo spoils faster', 'Vehicle handling is unpredictable — partial loads shift during braking/turning', 'Tank pressure increases', 'Engine overload'],
    answer: 1,
    rationale: 'Liquid surge in a partially loaded tanker can override braking force (pushing the vehicle forward when stopping) and cause rollovers when turning.'
  },
  {
    id: 62, domain: 'special',
    q: 'High center of gravity vehicles (tankers, double-decks) are most likely to roll over when:',
    options: ['Driving on a straight highway', 'Taking exit ramps or curves too fast', 'Changing lanes at low speed', 'Braking hard on a flat road'],
    answer: 1,
    rationale: 'Rollover risk peaks on curves and ramps where lateral forces act on a high center of gravity. Always reduce speed before curves, not during.'
  },
  {
    id: 63, domain: 'special',
    q: 'What is the minimum distance a CMV must keep from a stopped school bus with flashing red lights?',
    options: ['10 feet', '15 feet', '25 feet', 'These rules only apply to cars, not CMVs'],
    answer: 1,
    rationale: 'All vehicles, including large trucks, must stop at least 15 feet from a stopped school bus displaying flashing red lights, per federal and most state laws.'
  },
  // Extra questions to reach a solid bank:
  {
    id: 64, domain: 'general',
    q: 'Which of the following is true about stopping distance for a large truck compared to a car at the same speed?',
    options: ['Trucks stop in about the same distance', 'Trucks stop in a shorter distance due to weight', 'Trucks stop in a much longer distance', 'Trucks stop faster on dry roads only'],
    answer: 2,
    rationale: 'A fully loaded tractor-trailer traveling at 55 mph needs approximately 400 feet to stop — nearly twice the distance required by a passenger car.'
  },
  {
    id: 65, domain: 'general',
    q: 'Federal law requires that cargo be inspected and if necessary re-secured:',
    options: ['Only at the start of the trip', 'After the first 50 miles, then every 150 miles or 3 hours', 'At every fuel stop', 'Only when driving through mountains'],
    answer: 1,
    rationale: 'FMCSA requires inspecting cargo within the first 50 miles and then every 3 hours or 150 miles thereafter, whichever comes first.'
  },
  {
    id: 66, domain: 'air_brakes',
    q: 'What is the purpose of the s-cam in a drum brake assembly?',
    options: ['Holds the brake drum in place', 'Rotates to push brake shoes outward against the drum', 'Controls air pressure to the chamber', 'Adjusts slack automatically'],
    answer: 1,
    rationale: 'The S-cam is the curved camshaft that rotates when the pushrod moves, forcing the brake shoes outward to contact the drum and create friction.'
  },
  {
    id: 67, domain: 'combination',
    q: 'What is a converter dolly?',
    options: ['A device for converting single axle to tandem', 'A set of axles with a fifth wheel used to connect a second trailer in a double', 'The coupling device on a B-train', 'The landing gear assembly'],
    answer: 1,
    rationale: 'A converter dolly is a small axle assembly with its own fifth wheel that allows a second semi-trailer to be towed behind the first, creating a doubles combination.'
  },
  {
    id: 68, domain: 'hazmat',
    q: 'When a hazmat incident occurs, the first thing the driver should do is:',
    options: ['Move the vehicle to a safe location immediately', 'Keep people away and call emergency services', 'Unload the hazmat immediately', 'Check local regulations before acting'],
    answer: 1,
    rationale: 'Keep people away from the scene and immediately notify emergency services. Do not move the vehicle unless it poses an immediate greater hazard (e.g., fire).'
  },
  {
    id: 69, domain: 'pre_trip',
    q: 'When checking the brake system on an air brake vehicle, after reaching 90 psi you should:',
    options: ['Immediately drive — 90 psi is sufficient', 'Wait for pressure to build to governor cut-out before releasing parking brakes', 'Release parking brakes at 60 psi', 'Drive slowly until pressure builds further'],
    answer: 1,
    rationale: 'You should wait until air pressure builds to the governor cut-out level (100–125 psi) before releasing the parking brakes and driving.'
  },
  {
    id: 70, domain: 'special',
    q: 'Which of these is true about driving in work zones?',
    options: ['Speed limits are suggestions only', 'Fines are often doubled in work zones', 'You may exceed the posted limit if traffic is moving faster', 'Work zone rules only apply at night'],
    answer: 1,
    rationale: 'Most states double fines for traffic violations in designated work zones, especially when workers are present.'
  },
  {
    id: 71, domain: 'general',
    q: 'What is the purpose of the CDL medical certificate?',
    options: ['To prove you passed the written tests', 'To certify you meet minimum physical standards to safely operate a CMV', 'To authorize you to carry hazmat', 'To document your driving record'],
    answer: 1,
    rationale: 'A valid medical certificate (DOT physical) is required for CDL holders, certifying they meet FMCSA minimum health and vision standards.'
  },
  {
    id: 72, domain: 'air_brakes',
    q: 'Why should you avoid using the parking brake when the brakes are very hot?',
    options: ['The parking brake cable may melt', 'The brake drums may warp or the spring brakes may lock', 'It increases air pressure dangerously', 'Hot brakes have too much friction'],
    answer: 1,
    rationale: 'Applying spring/parking brakes on very hot brake drums can cause the drums to warp, cracking or locking the brakes. Let them cool with the vehicle moving slowly or brakes released.'
  },
  {
    id: 73, domain: 'combination',
    q: 'When making a right turn with a tractor-trailer, you should:',
    options: ['Swing wide to the left before turning right', 'Stay close to the right curb throughout', 'Turn sharply right immediately', 'Use the shoulder to complete the turn'],
    answer: 0,
    rationale: 'The rear trailer tires "cut the corner" — swing wide left before turning right so the trailer wheels clear the curb and do not mount the sidewalk.'
  },
  {
    id: 74, domain: 'hazmat',
    q: 'The Emergency Response Guidebook (ERG) is used by:',
    options: ['CDL testing examiners only', 'First responders to identify hazmat and initial response actions', 'DOT inspectors only', 'Shippers when packaging hazmat'],
    answer: 1,
    rationale: 'The ERG is a reference guide for first responders (fire, police, EMS) to quickly identify hazardous materials and take appropriate initial action at an incident.'
  },
  {
    id: 75, domain: 'pre_trip',
    q: 'If you find a cracked or bulging tire during pre-trip, you must:',
    options: ['Drive to the nearest tire shop immediately', 'Monitor it and stop every 50 miles', 'Take the vehicle out of service — do not drive', 'Add air pressure to make it safe'],
    answer: 2,
    rationale: 'Cracked, bulged, or visibly defective tires are out-of-service conditions. The tire must be replaced before the vehicle is driven.'
  },
];
