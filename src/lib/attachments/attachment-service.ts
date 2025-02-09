import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/env';
import { validateAttachment } from '@/lib/attachments/attachment-validator';
import { type Attachment, AttachmentStatus } from '@prisma/client';
import { prisma } from '@/lib/utils';
import { generateUUID } from '@/lib/utils';

export class AttachmentService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_ENDPOINT,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  /**
   * Gets all attachments for a user with optional status filter
   */
  async getUserAttachments(userId: string, status?: AttachmentStatus) {
    return prisma.attachment.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Gets all attachments for a message
   */
  async getMessageAttachments(messageId: string) {
    return prisma.attachment.findMany({
      where: {
        messageId,
        status: AttachmentStatus.active,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Uploads a file and creates a pending attachment
   */
  async uploadFile(file: File, userId: string): Promise<{
    id: string;
    url: string;
    name: string;
    contentType: string;
  }> {
    // Validate the file
    const validationResult = validateAttachment({
      name: file.name,
      size: file.size,
      contentType: file.type
    });

    if (!validationResult.isValid || !validationResult.sanitizedName || !validationResult.contentType) {
      throw new Error(validationResult.error || 'Invalid file');
    }

    // Generate unique S3 key
    const uniqueFilename = `${generateUUID()}${this.getFileExtension(validationResult.sanitizedName)}`;
    const key = `uploads/${userId}/${uniqueFilename}`;

    // Upload to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    await this.s3Client.send(new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: validationResult.contentType,
    }));

    // Generate signed URL
    const signedUrl = await this.getSignedUrl(key);

    const attachment = await prisma.attachment.create({
      data: {
        name: validationResult.sanitizedName,
        url: key,
        contentType: validationResult.contentType,
        status: AttachmentStatus.pending,
        userId,
      },
    });

    return {
      id: attachment.id,
      url: signedUrl,
      name: attachment.name,
      contentType: attachment.contentType,
    };
  }

  /**
   * Associates pending attachments with a message
   */
  async activateAttachments(attachmentIds: string[], messageId: string, userId: string): Promise<void> {
    await prisma.attachment.updateMany({
      where: {
        id: { in: attachmentIds },
        userId,
        status: AttachmentStatus.pending,
      },
      data: {
        messageId,
        status: AttachmentStatus.active,
      },
    });
  }

  /**
   * Marks attachments for deletion and removes from S3
   */
  async deleteAttachment(attachmentId: string, userId: string): Promise<void> {
    const attachment = await prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        userId,
      },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Delete from S3
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: attachment.url,
    }));

    // Mark as deleted in database
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { status: 'deleted' },
    });
  }

  /**
   * Transitions an attachment from one status to another
   * Only allows valid transitions:
   * pending -> active
   * pending -> deleted
   * active -> deleted
   */
  async transitionStatus(attachmentId: string, userId: string, newStatus: AttachmentStatus, messageId?: string): Promise<void> {
    const attachment = await prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Validate status transition
    const isValidTransition = this.isValidStatusTransition(attachment.status as AttachmentStatus, newStatus);
    if (!isValidTransition) {
      throw new Error(`Invalid status transition from ${attachment.status} to ${newStatus}`);
    }

    // If transitioning to active, messageId is required
    if (newStatus === 'active' && !messageId) {
      throw new Error('MessageId is required when activating an attachment');
    }

    // If transitioning to deleted, remove from S3
    if (newStatus === 'deleted') {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: attachment.url,
      }));
    }

    // Update status
    await prisma.attachment.update({
      where: { id: attachmentId },
      data: {
        status: newStatus,
        ...(messageId && { messageId }),
      },
    });
  }

  /**
   * Cleans up pending attachments older than the specified hours
   */
  async cleanupPendingAttachments(olderThanHours: number = 24): Promise<void> {
    const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    const pendingAttachments = await prisma.attachment.findMany({
      where: {
        status: AttachmentStatus.pending,
        createdAt: { lt: cutoffDate },
      },
    });

    // Delete from S3 and update status in parallel
    await Promise.all(pendingAttachments.map(async (attachment: Attachment) => {
      try {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: env.S3_BUCKET_NAME,
          Key: attachment.url,
        }));

        await prisma.attachment.update({
          where: { id: attachment.id },
          data: { status: AttachmentStatus.deleted },
        });
      } catch (error) {
        console.error(`Failed to cleanup attachment ${attachment.id}:`, error);
      }
    }));
  }

  /**
   * Permanently deletes attachments marked as deleted
   * This is a maintenance task that should be run periodically
   */
  async purgeDeletedAttachments(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

    const deletedAttachments = await prisma.attachment.findMany({
      where: {
        status: AttachmentStatus.deleted,
        updatedAt: { lt: cutoffDate },
      },
    });

    // Delete from database
    if (deletedAttachments.length > 0) {
      await prisma.attachment.deleteMany({
        where: {
          id: { in: deletedAttachments.map(a => a.id) },
        },
      });
    }
  }

  /**
   * Gets a signed URL for an attachment
   */
  private async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  /**
   * Gets file extension with dot
   */
  private getFileExtension(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    return ext ? `.${ext}` : '';
  }

  /**
   * Validates if a status transition is allowed
   */
  private isValidStatusTransition(currentStatus: AttachmentStatus, newStatus: AttachmentStatus): boolean {
    const allowedTransitions: Record<AttachmentStatus, AttachmentStatus[]> = {
      pending: [AttachmentStatus.pending, AttachmentStatus.deleted],
      active: [AttachmentStatus.deleted],
      deleted: [],
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) ?? false;
  }
} 