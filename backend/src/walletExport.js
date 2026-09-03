/**
 * FR-04 CSV and PDF builders for the household wallet API.
 */

const {
  TXN_STATUS_LABELS,
  TXN_TYPE,
  TXN_TYPE_LABELS,
} = require('./walletLedger');

const LINES_PER_PAGE = 46;

/**
 * Format a transaction timestamp like "Aug 23, 2026".
 * @param {string} isoDate ISO date string.
 * @returns {string} Short date.
 */
function formatTxnDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Escape a CSV cell.
 * @param {*} value Cell value.
 * @returns {string} CSV field.
 */
function csvCell(value) {
  const text = String(value == null ? '' : value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Build a UTF-8 CSV of wallet activity.
 * @param {object[]} transactions Ledger rows.
 * @param {{pendingBdt: number, availableBdt: number, earnedBdt: number}} summary
 *   Wallet totals.
 * @returns {string} CSV text.
 */
function buildWalletCsv(transactions, summary) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const header = [
    'ID',
    'Date',
    'Type',
    'Reference',
    'Amount (BDT)',
    'Status',
    'Review',
  ];
  const lines = [
    csvCell('SWEEP household wallet'),
    `Available,${summary.availableBdt}`,
    `Pending,${summary.pendingBdt}`,
    `Total earned,${summary.earnedBdt}`,
    '',
    header.join(','),
  ];
  rows.forEach((row) => {
    const isOut = row.type === TXN_TYPE.WITHDRAWAL;
    const amount = isOut ? -Number(row.amountBdt) : Number(row.amountBdt);
    const review = row.review ? `${row.review.rating}/5` : '';
    lines.push([
      csvCell(row.id),
      csvCell(formatTxnDate(row.createdAt)),
      csvCell(TXN_TYPE_LABELS[row.type] || row.type),
      csvCell(row.reference || ''),
      amount,
      csvCell(TXN_STATUS_LABELS[row.status] || row.status),
      csvCell(review),
    ].join(','));
  });
  return `\uFEFF${lines.join('\n')}`;
}

/**
 * Strip characters Helvetica cannot encode.
 * @param {string} text Source text.
 * @returns {string} WinAnsi-safe text.
 */
function toWinAnsi(text) {
  return String(text || '')
    .replace(/৳/g, 'BDT ')
    .replace(/[^\t\n\r -~]/g, '?');
}

/**
 * Escape a PDF literal string.
 * @param {string} text Source text.
 * @returns {string} Escaped text.
 */
function escapePdf(text) {
  return toWinAnsi(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Content stream for one PDF page of lines.
 * @param {string[]} pageLines Lines to draw.
 * @returns {string} PDF content stream.
 */
function pageStream(pageLines) {
  const ops = ['BT', '/F1 10 Tf', '50 760 Td', '14 TL'];
  pageLines.forEach((line, index) => {
    const text = `(${escapePdf(line)}) Tj`;
    if (index === 0) {
      ops.push(text);
    } else {
      ops.push('T*', text);
    }
  });
  ops.push('ET');
  return ops.join('\n');
}

/**
 * Assemble a multi-page PDF 1.4 document from line groups.
 * @param {string[][]} pages Lines per page.
 * @returns {string} ASCII PDF bytes as a string.
 */
function assemblePdf(pages) {
  const count = pages.length || 1;
  const pageNums = pages.map((_, index) => 3 + index);
  const contentNums = pages.map((_, index) => 3 + count + index);
  const fontNum = 2 + (2 * count) + 1;
  const bodies = [];
  const kids = pageNums.map((num) => `${num} 0 R`).join(' ');

  bodies[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  bodies[2] = `<< /Type /Pages /Kids [${kids}] /Count ${count} >>`;

  const safePages = pages.length > 0 ? pages : [['(empty)']];
  safePages.forEach((pageLines, index) => {
    const pageNum = pageNums[index] || 3;
    const contentNum = contentNums[index] || 4;
    bodies[pageNum] = [
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]',
      `/Contents ${contentNum} 0 R`,
      `/Resources << /Font << /F1 ${fontNum} 0 R >> >> >>`,
    ].join(' ');
    const stream = pageStream(pageLines);
    bodies[contentNum] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  bodies[fontNum] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';

  let out = '%PDF-1.4\n';
  const offsets = [0];
  for (let index = 1; index <= fontNum; index += 1) {
    offsets[index] = out.length;
    out += `${index} 0 obj\n${bodies[index]}\nendobj\n`;
  }
  const xrefPos = out.length;
  out += `xref\n0 ${fontNum + 1}\n`;
  out += '0000000000 65535 f \n';
  for (let index = 1; index <= fontNum; index += 1) {
    out += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${fontNum + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
  return out;
}

/**
 * Format one ledger row as a single PDF line.
 * @param {object} row Transaction.
 * @returns {string} Line text.
 */
function pdfRow(row) {
  const isOut = row.type === TXN_TYPE.WITHDRAWAL;
  const amount = `${isOut ? '-' : '+'}${Number(row.amountBdt) || 0}`;
  const typeLabel = TXN_TYPE_LABELS[row.type] || row.type;
  const status = TXN_STATUS_LABELS[row.status] || row.status;
  const review = row.review ? ` ${row.review.rating}/5` : '';
  return `${row.id}  ${formatTxnDate(row.createdAt)}  ${typeLabel}  `
    + `${row.reference || '-'}  ${amount}  ${status}${review}`;
}

/**
 * Build a downloadable PDF of the household wallet.
 * @param {object[]} transactions Ledger rows.
 * @param {{pendingBdt: number, availableBdt: number, earnedBdt: number}} summary
 *   Wallet totals.
 * @returns {string} PDF file contents.
 */
function buildWalletPdf(transactions, summary) {
  const rows = Array.isArray(transactions) ? transactions : [];
  const lines = [
    'SWEEP household wallet',
    `Available: BDT ${summary.availableBdt}`,
    `Pending: BDT ${summary.pendingBdt}`,
    `Total earned: BDT ${summary.earnedBdt}`,
    '',
    'ID  Date  Type  Reference  Amount  Status  Review',
    ...rows.map(pdfRow),
  ];
  const pages = [];
  for (let index = 0; index < lines.length; index += LINES_PER_PAGE) {
    pages.push(lines.slice(index, index + LINES_PER_PAGE));
  }
  return assemblePdf(pages);
}

module.exports = { buildWalletCsv, buildWalletPdf, formatTxnDate };
