import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/env';
import { auth } from '@/app/(auth)/auth';
import { generateUUID } from '@/lib/utils';
import { validateAttachment } from '@/lib/attachment-validator';
import { createAttachment, deleteAttachment, getAttachment } from '@/prisma/queries';

const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for Supabase Storage
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const messageId = formData.get('messageId') as string | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate the attachment
    const validationResult = validateAttachment({
      name: file.name,
      size: file.size,
      contentType: file.type
    });

    if (!validationResult.isValid || !validationResult.sanitizedName) {
      return Response.json(
        { error: validationResult.error || 'Invalid file' },
        { status: 400 }
      );
    }

    const uniqueFilename = `${generateUUID()}${getFileExtension(validationResult.sanitizedName)}`;
    const key = `uploads/${session.user.id}/${uniqueFilename}`;

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: validationResult.contentType,
    });

    await s3Client.send(putCommand);

    // Generate a signed URL for reading the uploaded file
    const getCommand = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });

    // Save attachment metadata to database if messageId is provided
    if (messageId) {
      await createAttachment({
        name: validationResult.sanitizedName,
        url: key,
        contentType: validationResult.contentType!,
        messageId
      });
    }

    return Response.json({
      url: signedUrl,
      name: validationResult.sanitizedName,
      contentType: validationResult.contentType
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Helper function to get file extension with dot
const getFileExtension = (filename: string): string => {
  if (!filename) return '';
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? `.${ext}` : '';
};

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return Response.json({ error: 'No attachment ID provided' }, { status: 400 });
    }

    // Get attachment from database
    const attachment = await getAttachment(attachmentId);

    if (!attachment) {
      return Response.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Delete from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: attachment.url,
    });

    await s3Client.send(deleteCommand);

    // Delete from database
    await deleteAttachment(attachmentId);

    return Response.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return Response.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 