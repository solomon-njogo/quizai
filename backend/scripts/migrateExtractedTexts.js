/**
 * Migration script to backfill extracted_texts table with existing course_materials data
 * 
 * This script:
 * 1. Finds all course_materials with extracted_text but no corresponding extracted_texts entry
 * 2. Creates extracted_texts entries for those materials
 * 3. Uses 'migration' as the extraction_method since we don't know the original method
 * 
 * Usage:
 *   node scripts/migrateExtractedTexts.js
 * 
 * Note: This script uses the service role key to bypass RLS policies
 */

import { supabase } from '../utils/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Calculate word count from text
 */
function calculateWordCount(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Main migration function
 */
async function migrateExtractedTexts() {
  try {
    console.log('Starting migration of extracted texts...');

    // Get all course materials with extracted_text but no corresponding extracted_texts entry
    // We need to use a raw query or fetch all materials and check
    const { data: materials, error: fetchError } = await supabase
      .from('course_materials')
      .select('id, user_id, extracted_text, created_at, updated_at')
      .not('extracted_text', 'is', null)
      .neq('extracted_text', '');

    if (fetchError) {
      console.error('Error fetching course materials:', fetchError);
      process.exit(1);
    }

    if (!materials || materials.length === 0) {
      console.log('No course materials with extracted text found. Migration complete.');
      return;
    }

    console.log(`Found ${materials.length} course materials with extracted text.`);

    // Get existing extracted_texts to avoid duplicates
    const { data: existingTexts, error: existingError } = await supabase
      .from('extracted_texts')
      .select('course_material_id');

    if (existingError) {
      console.error('Error fetching existing extracted texts:', existingError);
      process.exit(1);
    }

    const existingMaterialIds = new Set(
      (existingTexts || []).map(et => et.course_material_id)
    );

    // Filter out materials that already have extracted_texts entries
    const materialsToMigrate = materials.filter(
      m => !existingMaterialIds.has(m.id)
    );

    if (materialsToMigrate.length === 0) {
      console.log('All course materials already have extracted_texts entries. Migration complete.');
      return;
    }

    console.log(`Migrating ${materialsToMigrate.length} course materials...`);

    // Prepare data for batch insert
    const extractedTextsData = materialsToMigrate.map(material => ({
      course_material_id: material.id,
      user_id: material.user_id,
      extracted_text: material.extracted_text,
      text_length: material.extracted_text.length,
      word_count: calculateWordCount(material.extracted_text),
      extraction_method: 'migration',
      created_at: material.created_at,
      updated_at: material.updated_at
    }));

    // Insert in batches to avoid overwhelming the database
    const batchSize = 100;
    let migratedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < extractedTextsData.length; i += batchSize) {
      const batch = extractedTextsData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('extracted_texts')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        migratedCount += data.length;
        console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}: ${data.length} records`);
      }
    }

    console.log('\nMigration complete!');
    console.log(`Successfully migrated: ${migratedCount} records`);
    if (errorCount > 0) {
      console.log(`Errors encountered: ${errorCount} records`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateExtractedTexts()
  .then(() => {
    console.log('Migration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

