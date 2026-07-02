const prisma = require('../config/database');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// Generate PDF invoice
const generateInvoicePDF = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        restaurant: { select: { name: true, address: true, phone: true, logo: true } },
        items: { include: { menu: { select: { name: true, price: true } } } },
        payment: true,
        invoice: true,
        reservation: { select: { id: true, reservationDate: true } }
      }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

    // Buat atau dapatkan invoice
    let invoice = order.invoice;
    if (!invoice) {
      const invoiceNumber = `INV-${Date.now()}-${order.id}`;
      invoice = await prisma.invoice.create({
        data: { orderId: order.id, invoiceNumber }
      });
    }

    // Generate QR Code
    const qrData = `CariMakan+|INV:${invoice.invoiceNumber}|ORDER:${order.orderNumber}|AMT:${order.totalAmount}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { width: 120, margin: 1 });

    // Setup PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `invoice-${invoice.invoiceNumber}.pdf`;
    const invoicesDir = path.join(__dirname, '../uploads/invoices');
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });
    const filePath = path.join(invoicesDir, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ---- HEADER ----
    // Logo placeholder (colored rect)
    doc.rect(50, 50, 120, 40).fill('#FF6B35');
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold').text('CariMakan+', 55, 62);

    // Invoice title
    doc.fillColor('#1a1a2e').fontSize(24).font('Helvetica-Bold').text('INVOICE', 350, 50, { align: 'right' });
    doc.fontSize(10).font('Helvetica').fillColor('#666').text(`#${invoice.invoiceNumber}`, 350, 78, { align: 'right' });
    doc.fontSize(10).text(`Tanggal: ${new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 350, 92, { align: 'right' });

    // Divider
    doc.moveTo(50, 105).lineTo(545, 105).strokeColor('#FF6B35').lineWidth(2).stroke();

    // ---- BILL FROM / BILL TO ----
    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text('DARI RESTORAN:', 50, 125);
    doc.fillColor('#333').fontSize(10).font('Helvetica')
      .text(order.restaurant.name, 50, 140)
      .text(order.restaurant.address || '-', 50, 155)
      .text(`Telp: ${order.restaurant.phone || '-'}`, 50, 170);

    doc.fillColor('#1a1a2e').fontSize(11).font('Helvetica-Bold').text('KEPADA:', 300, 125);
    doc.fillColor('#333').fontSize(10).font('Helvetica')
      .text(order.customer.name, 300, 140)
      .text(order.customer.email || '-', 300, 155)
      .text(`Telp: ${order.customer.phone || '-'}`, 300, 170);

    // ---- ORDER INFO ----
    doc.roundedRect(50, 195, 495, 55, 5).fill('#f8f9fa');
    doc.fillColor('#333').fontSize(9).font('Helvetica-Bold');
    doc.text('Nomor Pesanan', 65, 205); doc.font('Helvetica').text(order.orderNumber, 65, 218);
    doc.font('Helvetica-Bold').text('Jenis Layanan', 200, 205); doc.font('Helvetica').text(order.serviceType, 200, 218);
    doc.font('Helvetica-Bold').text('Metode Bayar', 330, 205); doc.font('Helvetica').text(order.payment?.paymentMethod || '-', 330, 218);
    doc.font('Helvetica-Bold').text('Status', 450, 205);
    const statusColor = order.payment?.status === 'SUCCESS' ? '#28a745' : '#dc3545';
    doc.fillColor(statusColor).text(order.payment?.status || 'UNPAID', 450, 218);

    // ---- ITEMS TABLE ----
    let y = 270;
    doc.fillColor('white').rect(50, y, 495, 20).fill('#FF6B35');
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');
    doc.text('MENU', 60, y + 6);
    doc.text('QTY', 340, y + 6, { width: 40, align: 'center' });
    doc.text('HARGA', 385, y + 6, { width: 75, align: 'right' });
    doc.text('SUBTOTAL', 460, y + 6, { width: 75, align: 'right' });

    y += 25;
    let subtotal = 0;
    order.items.forEach((item, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9f9f9';
      doc.rect(50, y - 3, 495, 18).fill(bg);
      doc.fillColor('#333').fontSize(9).font('Helvetica');
      doc.text(item.menu.name, 60, y);
      doc.text(item.quantity.toString(), 340, y, { width: 40, align: 'center' });
      doc.text(`Rp ${Number(item.price).toLocaleString('id-ID')}`, 385, y, { width: 75, align: 'right' });
      const sub = Number(item.price) * item.quantity;
      subtotal += sub;
      doc.text(`Rp ${sub.toLocaleString('id-ID')}`, 460, y, { width: 75, align: 'right' });
      y += 18;
    });

    // ---- TOTALS ----
    y += 10;
    doc.moveTo(50, y).lineTo(545, y).strokeColor('#ddd').lineWidth(1).stroke();
    y += 10;

    const tax = Number(order.tax);
    const deliveryFee = Number(order.deliveryFee);
    const total = Number(order.totalAmount);

    const addTotalLine = (label, value, bold = false, color = '#333') => {
      doc.fillColor('#666').fontSize(9).font('Helvetica').text(label, 350, y);
      doc.fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 9)
        .text(`Rp ${value.toLocaleString('id-ID')}`, 460, y, { width: 75, align: 'right' });
      y += 16;
    };

    addTotalLine('Subtotal', subtotal);
    addTotalLine('Pajak (10%)', tax);
    if (deliveryFee > 0) addTotalLine('Ongkos Kirim', deliveryFee);

    doc.moveTo(350, y).lineTo(545, y).strokeColor('#FF6B35').lineWidth(1.5).stroke();
    y += 8;
    addTotalLine('TOTAL PEMBAYARAN', total, true, '#FF6B35');

    // ---- QR CODE ----
    y += 20;
    doc.image(qrCodeBuffer, 50, y, { width: 90, height: 90 });
    doc.fillColor('#666').fontSize(8).font('Helvetica').text('Scan QR untuk verifikasi', 50, y + 93, { width: 90, align: 'center' });

    // ---- FOOTER ----
    doc.moveTo(50, 760).lineTo(545, 760).strokeColor('#FF6B35').lineWidth(1).stroke();
    doc.fillColor('#999').fontSize(8).font('Helvetica')
      .text('CariMakan+ — Platform Reservasi & Pemesanan Makanan Online', 50, 768, { align: 'center', width: 495 })
      .text('Terima kasih telah menggunakan CariMakan+. Selamat menikmati!', 50, 780, { align: 'center', width: 495 });

    doc.end();

    stream.on('finish', async () => {
      // Simpan path PDF ke invoice
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl: `/uploads/invoices/${filename}` }
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      fs.createReadStream(filePath).pipe(res);
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal generate invoice.' });
  }
};

// Get invoice data (JSON)
const getInvoiceByOrder = async (req, res) => {
  const { orderId } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { orderId: parseInt(orderId) },
      include: {
        order: {
          include: {
            customer: { select: { name: true, email: true, phone: true } },
            restaurant: { select: { name: true, address: true, phone: true } },
            items: { include: { menu: { select: { name: true, price: true } } } },
            payment: true
          }
        }
      }
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan.' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { generateInvoicePDF, getInvoiceByOrder };
