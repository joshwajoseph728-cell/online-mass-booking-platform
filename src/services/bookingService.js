// Mass Intention Booking Management & Workflow Engine

import { firestoreService } from './firestoreService.js';
import { notificationService } from './notificationService.js';
import { generateBookingId } from '../utils/formatters.js';
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants.js';
import { getTodayDateString } from '../utils/dateUtils.js';

export const bookingService = {
  // Retrieve all bookings (Admin/Priest view)
  async getAllBookings() {
    const list = await firestoreService.getCollection('massIntentions');
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  },

  // Retrieve user bookings
  async getMemberBookings(userId) {
    const list = await this.getAllBookings();
    if (!userId) return list;
    return list.filter(b => b.userId === userId);
  },

  // Retrieve specific booking
  async getBooking(bookingId) {
    return await firestoreService.getDocument('massIntentions', bookingId);
  },

  // Create New Mass Booking
  async createBooking({
    userId,
    fullName,
    phone,
    email,
    intentionType,
    personNames,
    massDate,
    massTime,
    notes = '',
    offeringAmount = 250,
    paymentMethod = 'Razorpay',
    paymentId = '',
    paymentStatus = null,
    receiptScreenshot = null,
    utrNumber = null,
    paymentVerificationMode = '',
    optionalRef = '',
    approvedBy = ''
  }) {
    const bookingId = generateBookingId();
    const isTodayBooking = massDate === getTodayDateString();

    const newBooking = {
      id: bookingId,
      bookingId,
      userId: userId || 'guest_member',
      fullName,
      phone,
      email,
      intentionType,
      personNames,
      massDate,
      massTime,
      notes,
      offeringAmount: Number(offeringAmount),
      paymentMethod,
      paymentStatus: paymentStatus || PAYMENT_STATUS.PAID,
      paymentId: paymentId || `pay_${Date.now()}`,
      receiptScreenshot: receiptScreenshot || null,
      utrNumber: utrNumber || null,
      paymentVerificationMode: paymentVerificationMode || (receiptScreenshot ? 'OPTION_2_SCREENSHOT' : utrNumber ? 'OPTION_1_UTR' : 'GATEWAY'),
      optionalRef: optionalRef || '',
      bookingStatus: (paymentStatus === 'PENDING_VERIFICATION') ? BOOKING_STATUS.PENDING.id : BOOKING_STATUS.APPROVED.id,
      approvedBy: (paymentStatus === 'PENDING_VERIFICATION') ? null : (approvedBy || 'Parish Vicar'),
      approvedAt: (paymentStatus === 'PENDING_VERIFICATION') ? null : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    // 1. Save in massIntentions collection
    await firestoreService.setDocument('massIntentions', bookingId, newBooking);

    // 2. Save in payments collection
    const paymentDocId = newBooking.paymentId;
    await firestoreService.setDocument('payments', paymentDocId, {
      id: paymentDocId,
      paymentId: paymentDocId,
      bookingId,
      userId: newBooking.userId,
      amount: newBooking.offeringAmount,
      status: newBooking.paymentStatus,
      paymentMethod,
      receiptScreenshot: receiptScreenshot || null,
      utrNumber: utrNumber || null,
      paymentVerificationMode: newBooking.paymentVerificationMode,
      optionalRef: optionalRef || '',
      createdAt: new Date().toISOString()
    });

    // 3. Dispatch in-app notification to member
    if (userId) {
      const isPending = newBooking.paymentStatus === 'PENDING_VERIFICATION';
      await notificationService.createNotification({
        userId,
        title: isPending ? 'Payment Submitted for Verification' : 'Mass Intention Confirmed',
        message: isPending
          ? `Your offering for ${personNames} (${utrNumber ? `UTR: ${utrNumber}` : 'Screenshot uploaded'}) has been submitted for parish verification. Booking ID: ${bookingId}`
          : `Your Mass intention for ${personNames} has been confirmed for ${massDate} at ${massTime}. Booking ID: ${bookingId}`,
        type: 'booking'
      });
    }

    // 4. Dispatch notification to priests/admin
    await notificationService.createNotification({
      userId: 'user_priest_01',
      title: newBooking.paymentStatus === 'PENDING_VERIFICATION' ? '📸 New Payment Verification Needed' : 'New Mass Intention Booked',
      message: newBooking.paymentStatus === 'PENDING_VERIFICATION'
        ? `${fullName} submitted payment (₹${newBooking.offeringAmount}) via ${newBooking.paymentMethod} for ${intentionType} on ${massDate}. Please verify.`
        : `New ${intentionType} intention for "${personNames}" scheduled on ${massDate} at ${massTime}.`,
      type: 'priest_alert'
    });

    return newBooking;
  },

  // Verify & Approve Receipt with Tick Mark (Priest / Admin) -> Releases to Altar Prayer Sheet
  async verifyAndApproveReceipt(bookingId, verifierName = 'Parish Priest') {
    const updates = {
      paymentStatus: PAYMENT_STATUS.PAID,
      bookingStatus: BOOKING_STATUS.APPROVED.id,
      approvedBy: verifierName,
      approvedAt: new Date().toISOString(),
      verifiedBy: verifierName,
      verifiedAt: new Date().toISOString()
    };

    const updated = await firestoreService.updateDocument('massIntentions', bookingId, updates);

    // Update payment record
    const payments = await firestoreService.getCollection('payments');
    const payRecord = payments.find(p => p.bookingId === bookingId);
    if (payRecord) {
      await firestoreService.updateDocument('payments', payRecord.id, {
        status: PAYMENT_STATUS.PAID,
        verifiedAt: new Date().toISOString()
      });
    }

    // 1. Notify member that payment is verified and official receipt is ready
    if (updated && updated.userId) {
      await notificationService.createNotification({
        userId: updated.userId,
        title: '✓ Payment Verified & Mass Scheduled',
        message: `Your offering for Mass intention (${bookingId}) was verified by ${verifierName}. Your intention is confirmed on the altar sheet and your official receipt is ready for download!`,
        type: 'booking_approved'
      });
    }

    // 2. Notify Rev. Father that names list has been added to the altar prayer sheet
    await notificationService.createNotification({
      userId: 'user_priest_01',
      title: '📖 Altar Prayer Sheet Updated',
      message: `Verified intention for "${updated?.personNames}" (${updated?.intentionType}) has been published to the Altar Prayer List for ${updated?.massDate} at ${updated?.massTime}.`,
      type: 'altar_update'
    });

    return updated;
  },

  // Reject Receipt (Priest / Admin)
  async rejectReceipt(bookingId, reason = 'Screenshot unclear or amount mismatch', rejectorName = 'Parish Office') {
    const updates = {
      paymentStatus: 'REJECTED',
      bookingStatus: BOOKING_STATUS.REJECTED.id,
      rejectionReason: reason,
      rejectedBy: rejectorName,
      rejectedAt: new Date().toISOString()
    };

    const updated = await firestoreService.updateDocument('massIntentions', bookingId, updates);

    if (updated && updated.userId) {
      await notificationService.createNotification({
        userId: updated.userId,
        title: '⚠️ Payment Receipt Rejected',
        message: `Your payment receipt for Mass intention (${bookingId}) could not be verified. Reason: "${reason}". Please contact church office or re-submit.`,
        type: 'booking_rejected'
      });
    }

    return updated;
  },

  // Approve / Update Booking Status
  async updateStatus(bookingId, status, notes = '', priestName = 'Parish Priest') {
    const updates = {
      bookingStatus: status,
      adminNotes: notes,
      updatedAt: new Date().toISOString()
    };

    if (status === BOOKING_STATUS.APPROVED.id) {
      updates.paymentStatus = PAYMENT_STATUS.PAID;
      updates.approvedBy = priestName;
      updates.approvedAt = new Date().toISOString();
    } else if (status === BOOKING_STATUS.COMPLETED.id) {
      updates.completedAt = new Date().toISOString();
      updates.completedBy = priestName;
    } else if (status === BOOKING_STATUS.REJECTED.id) {
      updates.paymentStatus = 'REJECTED';
    }

    const updated = await firestoreService.updateDocument('massIntentions', bookingId, updates);

    if (updated && updated.userId) {
      let msg = `Your Mass intention ${bookingId} status is now: ${status}.`;
      if (notes) msg += ` Note: ${notes}`;
      await notificationService.createNotification({
        userId: updated.userId,
        title: `Mass Intention ${status}`,
        message: msg,
        type: 'status_update'
      });
    }

    return updated;
  },

  // Retrieve today's intentions grouped by Mass time & intention category
  async getGroupedIntentionsForDate(dateStr = getTodayDateString()) {
    const all = await this.getAllBookings();
    const dateIntentions = all.filter(
      b => b.massDate === dateStr &&
      (b.bookingStatus === BOOKING_STATUS.APPROVED.id || b.bookingStatus === BOOKING_STATUS.SCHEDULED.id || b.bookingStatus === BOOKING_STATUS.COMPLETED.id) &&
      (b.paymentStatus === PAYMENT_STATUS.PAID || b.paymentStatus === 'PAID')
    );

    // Group by Mass Time: { '07:00 AM': [...], '06:00 PM': [...] }
    const groupedByTime = {};

    dateIntentions.forEach(item => {
      const time = item.massTime || '07:00 AM';
      if (!groupedByTime[time]) {
        groupedByTime[time] = [];
      }
      groupedByTime[time].push(item);
    });

    // Sub-group within time by category: { '07:00 AM': { 'Departed Soul': [...], 'Thanksgiving': [...] } }
    const structured = {};
    Object.keys(groupedByTime).forEach(time => {
      structured[time] = {
        all: groupedByTime[time],
        categories: {
          'Departed Soul': groupedByTime[time].filter(i => i.intentionType === 'Departed Soul'),
          'Thanksgiving': groupedByTime[time].filter(i => i.intentionType === 'Thanksgiving'),
          'Healing Prayer': groupedByTime[time].filter(i => i.intentionType === 'Healing Prayer'),
          'Special Intention': groupedByTime[time].filter(i => i.intentionType === 'Special Intention')
        }
      };
    });

    return { raw: dateIntentions, byTime: groupedByTime, structured };
  }
};
