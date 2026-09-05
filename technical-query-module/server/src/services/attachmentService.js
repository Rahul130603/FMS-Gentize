const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { query } = require('../config/db');
const ApiError = require('../utils/apiError');
const auditService = require('./auditService');

async function saveAttachments(queryId, files, user) {
  if (!files || !files.length) return [];
  const saved = [];
  for (const file of files) {
    const { rows } = await query(
      `INSERT INTO technical_query_attachments
        (query_id, filename, original_name, filepath, mime_type, size_bytes, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [queryId, file.filename, file.originalname, file.path, file.mimetype, file.size, user.id]
    );
    saved.push(rows[0]);
  }

  await auditService.logEvent(null, {
    queryId,
    actorId: user.id,
    actorName: user.name,
    eventType: 'attachment_added',
    note: `Added ${files.length} attachment(s): ${files.map((f) => f.originalname).join(', ')}`,
  });

  return saved;
}

async function listAttachments(queryId) {
  const { rows } = await query(
    `SELECT * FROM technical_query_attachments WHERE query_id = $1 ORDER BY uploaded_at ASC`,
    [queryId]
  );
  return rows;
}

async function getAttachmentById(attachmentId) {
  const { rows } = await query(`SELECT * FROM technical_query_attachments WHERE id = $1`, [attachmentId]);
  if (!rows[0]) throw ApiError.notFound('Attachment not found');
  return rows[0];
}

/** Streams every attachment for a query into a zip on the response object. */
async function streamAllAsZip(queryId, queryNumber, res) {
  const attachments = await listAttachments(queryId);
  if (!attachments.length) throw ApiError.notFound('No attachments found for this query');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${queryNumber}-attachments.zip"`);

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(res);
  attachments.forEach((att) => {
    if (fs.existsSync(att.filepath)) {
      archive.file(att.filepath, { name: att.original_name });
    }
  });
  await archive.finalize();
}

module.exports = { saveAttachments, listAttachments, getAttachmentById, streamAllAsZip };
