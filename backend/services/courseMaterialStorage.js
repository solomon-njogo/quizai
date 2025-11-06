import { supabase } from '../utils/supabase.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const STORAGE_BUCKET = 'course-materials';

/**
 * Ensure the storage bucket exists, create if it doesn't
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function ensureBucketExists() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      return { success: false, error: listError.message };
    }

    const bucketExists = buckets?.some(bucket => bucket.name === STORAGE_BUCKET);
    
    if (!bucketExists) {
      // Create bucket with public access disabled (private)
      const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false
      });

      if (createError) {
        return { success: false, error: createError.message };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return {
      success: false,
      error: `Failed to ensure bucket exists: ${error.message}`
    };
  }
}

/**
 * Upload a file to Supabase Storage
 * @param {string} userId - User ID
 * @param {string} filePath - Local file path
 * @param {string} originalFilename - Original filename
 * @param {string} mimeType - MIME type
 * @returns {Promise<{data: {storagePath: string, publicUrl: string}|null, error: string|null}>}
 */
export async function uploadFileToStorage(userId, filePath, originalFilename, mimeType) {
  try {
    // Ensure bucket exists
    const { success, error: bucketError } = await ensureBucketExists();
    if (!success) {
      return { data: null, error: bucketError };
    }

    // Generate unique filename
    const fileExtension = path.extname(originalFilename);
    const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const storageFilename = `${uniqueSuffix}-${sanitizedName}`;
    const storagePath = `${userId}/${storageFilename}`;

    // Read file buffer
    const fileBuffer = await fs.readFile(filePath);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      return { data: null, error: error.message };
    }

    // Get public URL (signed URL for private buckets)
    const { data: urlData } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, 31536000); // 1 year expiry

    return {
      data: {
        storagePath: data.path,
        publicUrl: urlData?.signedUrl || null
      },
      error: null
    };
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    return {
      data: null,
      error: `Failed to upload file: ${error.message}`
    };
  }
}

/**
 * Download a file from Supabase Storage to a temporary location
 * @param {string} storagePath - Path in storage
 * @returns {Promise<{data: {tempPath: string}|null, error: string|null}>}
 */
export async function downloadFileFromStorage(storagePath) {
  try {
    // Download file from storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (error) {
      return { data: null, error: error.message };
    }

    // Create temporary file
    const tempDir = os.tmpdir();
    const tempFilename = `temp-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(storagePath)}`;
    const tempPath = path.join(tempDir, tempFilename);

    // Convert blob to buffer and write to temp file
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempPath, buffer);

    return {
      data: { tempPath },
      error: null
    };
  } catch (error) {
    console.error('Error downloading file from storage:', error);
    return {
      data: null,
      error: `Failed to download file: ${error.message}`
    };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} storagePath - Path in storage
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deleteFileFromStorage(storagePath) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    return {
      success: false,
      error: `Failed to delete file: ${error.message}`
    };
  }
}

/**
 * Get a signed URL for a file in storage
 * @param {string} storagePath - Path in storage
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<{data: {url: string}|null, error: string|null}>}
 */
export async function getSignedUrl(storagePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: { url: data.signedUrl },
      error: null
    };
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return {
      data: null,
      error: `Failed to get signed URL: ${error.message}`
    };
  }
}

