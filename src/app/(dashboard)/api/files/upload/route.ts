import { auth } from '@/lib/auth';
import { AttachmentService } from '@/lib/attachments/attachment-service';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const messageId = formData.get('messageId') as string | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const attachmentService = new AttachmentService();

    // Upload file and create pending attachment
    const result = await attachmentService.uploadFile(file, session.user.id);

    // If messageId is provided, activate the attachment immediately
    if (messageId) {
      await attachmentService.activateAttachments([result.id], messageId, session.user.id);
    }

    return Response.json({
      id: result.id,
      url: result.url,
      name: result.name,
      contentType: result.contentType
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return Response.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get('id');

    if (!attachmentId) {
      return Response.json({ error: 'No attachment ID provided' }, { status: 400 });
    }

    const attachmentService = new AttachmentService();
    await attachmentService.deleteAttachment(attachmentId, session.user.id);

    return Response.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return Response.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 