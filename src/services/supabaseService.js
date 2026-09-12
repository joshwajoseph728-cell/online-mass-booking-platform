// Supabase Database Service
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export const supabaseService = {
  isConfigured() {
    return isSupabaseConfigured;
  },

  // 1. BOOKINGS (MASS INTENTIONS & NAMES)
  async getAllBookings() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(row => ({
        id: row.id,
        bookingId: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        phone: row.phone,
        email: row.email,
        intentionType: row.intention_type,
        numberOfSouls: row.number_of_souls,
        personNames: row.person_names,
        massDate: row.mass_date,
        massTime: row.mass_time,
        notes: row.notes,
        offeringAmount: Number(row.offering_amount),
        paymentId: row.payment_id,
        paymentMethod: row.payment_method,
        paymentStatus: row.payment_status,
        paymentVerificationMode: row.payment_verification_mode,
        utrNumber: row.utr_number,
        receiptScreenshot: row.receipt_screenshot,
        optionalRef: row.optional_ref,
        bookingStatus: row.booking_status,
        approvedBy: row.approved_by,
        createdAt: row.created_at
      }));
    } catch (err) {
      console.warn('⚠️ Supabase fetch bookings error:', err);
      return null;
    }
  },

  async saveBooking(booking) {
    if (!isSupabaseConfigured) return null;
    try {
      const payload = {
        id: booking.id || booking.bookingId,
        user_id: booking.userId || 'guest_member',
        full_name: booking.fullName,
        phone: booking.phone,
        email: booking.email || '',
        intention_type: booking.intentionType,
        number_of_souls: booking.numberOfSouls || 1,
        person_names: booking.personNames,
        mass_date: booking.massDate,
        mass_time: booking.massTime,
        notes: booking.notes || '',
        offering_amount: Number(booking.offeringAmount || 50),
        payment_id: booking.paymentId || '',
        payment_method: booking.paymentMethod || 'UPI Payment',
        payment_status: booking.paymentStatus || 'PENDING_VERIFICATION',
        payment_verification_mode: booking.paymentVerificationMode || '',
        utr_number: booking.utrNumber || null,
        receipt_screenshot: booking.receiptScreenshot || null,
        optional_ref: booking.optionalRef || '',
        booking_status: booking.bookingStatus || 'PENDING',
        approved_by: booking.approvedBy || null
      };

      const { data, error } = await supabase
        .from('bookings')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase save booking error:', err);
      return null;
    }
  },

  async updateBooking(bookingId, updates) {
    if (!isSupabaseConfigured) return null;
    try {
      const dbUpdates = {};
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.bookingStatus) dbUpdates.booking_status = updates.bookingStatus;
      if (updates.approvedBy) dbUpdates.approved_by = updates.approvedBy;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.utrNumber) dbUpdates.utr_number = updates.utrNumber;
      if (updates.receiptScreenshot) dbUpdates.receipt_screenshot = updates.receiptScreenshot;

      const { data, error } = await supabase
        .from('bookings')
        .update(dbUpdates)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('⚠️ Supabase update booking error:', err);
      return null;
    }
  },

  // 2. SCHEDULES
  async getSchedules() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('schedules').select('*');
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data.map(row => ({
        id: row.id,
        dayType: row.day_type,
        time: row.time,
        language: row.language,
        location: row.location,
        priestName: row.priest_name,
        maxCapacity: row.max_capacity,
        active: row.active
      }));
    } catch (err) {
      console.warn('⚠️ Supabase getSchedules error:', err);
      return null;
    }
  },

  // 3. PRIESTS
  async getPriests() {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase.from('priests').select('*');
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data.map(row => ({
        id: row.id,
        name: row.name,
        designation: row.designation,
        ordinationYear: row.ordination_year,
        phone: row.phone,
        email: row.email,
        photoURL: row.photo_url,
        isCelebrant: row.is_celebrant,
        active: row.active
      }));
    } catch (err) {
      console.warn('⚠️ Supabase getPriests error:', err);
      return null;
    }
  },

  // 4. REALTIME LIVE SYNC
  subscribeToBookings(callback) {
    if (!isSupabaseConfigured) return null;
    try {
      const channel = supabase
        .channel('realtime_bookings_stream')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'bookings' },
          (payload) => {
            if (typeof callback === 'function') {
              callback(payload);
            }
          }
        )
        .subscribe();

      return channel;
    } catch (err) {
      console.warn('⚠️ Supabase realtime subscription error:', err);
      return null;
    }
  }
};
