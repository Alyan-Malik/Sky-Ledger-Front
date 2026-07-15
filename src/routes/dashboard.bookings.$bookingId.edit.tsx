// src/routes/dashboard.bookings.$bookingId.edit.tsx

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Loader2, AlertTriangle, ArrowLeft, Save, User, Mail, Phone,
  CreditCard, FileText, Utensils, Luggage, Accessibility, Users, MapPin
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Booking } from "@/types/booking";
import { bookingService } from "@/services/booking-service";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/bookings/$bookingId/edit")({
  head: () => ({ meta: [{ title: "Edit Booking — SkyLedger" }] }),
  component: EditBookingPage,
});

function EditBookingPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { fetchBooking(); }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBooking(Number(bookingId));
      if (response.success && response.data) {
        const b = response.data;
        setBooking(b);
        setFormData({
          booking_id: b.booking_id || '',
          pnr_number: b.pnr_number || '',
          eticket_number: b.eticket_number || '',
          passenger_first_name: b.passenger.first_name || '',
          passenger_last_name: b.passenger.last_name || '',
          gender: b.passenger.gender || '',
          date_of_birth: b.passenger.date_of_birth || '',
          nationality: b.passenger.nationality || '',
          passport_number: b.passenger.passport_number || '',
          passport_expiry: b.passenger.passport_expiry || '',
          cnic: b.passenger.cnic || '',
          email: b.contact.email || '',
          phone: b.contact.phone || '',
          emergency_contact: b.contact.emergency_contact || '',
          address: b.address?.address || '',
          city: b.address?.city || '',
          country: b.address?.country || '',
          zip_code: b.address?.zip_code || '',
          additional_passengers: b.additional_passengers || [],
          checked_baggage_count: b.baggage?.checked_count || 0,
          hand_luggage_count: b.baggage?.hand_luggage_count || 0,
          wheelchair_required: b.assistance?.wheelchair || 'none',
          priority_pass: b.assistance?.priority_pass || false,
          seat_number: b.preferences?.seat_number || '',
          meal_preference: b.preferences?.meal_preference || '',
          special_assistance: b.preferences?.special_assistance || '',
          remarks: b.remarks || '',
    checked_baggage_kg: b.baggage?.checked_kg || 23, // NEW
    hand_luggage_kg: b.baggage?.hand_luggage_kg || 7, // NEW
    seat_preference: b.preferences?.seat_preference || '', // NEW
    extra_legroom: b.preferences?.extra_legroom || false, // NEW
    economy_delight: b.preferences?.economy_delight || false, // NEW
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAdditionalPassengerChange = (index: number, field: string, value: string) => {
    setFormData((prev: any) => {
      const updated = [...(prev.additional_passengers || [])];
      if (updated[index]) updated[index] = { ...updated[index], [field]: value };
      return { ...prev, additional_passengers: updated };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.passenger_first_name?.trim()) newErrors.passenger_first_name = 'First name is required';
    if (!formData.passenger_last_name?.trim()) newErrors.passenger_last_name = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSaving(true);
      await bookingService.updateBooking(Number(bookingId), formData);
      toast.success('Booking Updated', {
        description: 'Booking details updated successfully.',
      });
      navigate({ to: '/dashboard/bookings/$bookingId/view', params: { bookingId } });
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err.response?.data?.message || 'Failed to update booking.',
      });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !booking) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
      <p className="text-slate-600 mb-4">{error || 'Booking not found'}</p>
      <Button onClick={() => navigate({ to: '/dashboard/bookings' })}><ArrowLeft className="h-4 w-4 mr-2" /> Back to Bookings</Button>
    </div>
  );

  const inputClass = "h-11 border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg";
  const labelClass = "text-sm font-medium text-slate-700 mb-1.5";

  return (
    <>
      <PageHeader
        title="Edit Booking"
        subtitle={`Editing booking ${booking.booking_id}`}
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Bookings", to: "/dashboard/bookings" },
          { label: booking.booking_id, to: `/dashboard/bookings/${bookingId}` },
          { label: "Edit" },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Booking References */}
        <Section title="Booking References" icon={<CreditCard className="h-5 w-5 text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Booking ID"><Input value={formData.booking_id} onChange={e => handleChange('booking_id', e.target.value)} className={inputClass} /></Field>
            <Field label="PNR Number"><Input value={formData.pnr_number} onChange={e => handleChange('pnr_number', e.target.value)} className={inputClass} /></Field>
            <Field label="E-ticket Number"><Input value={formData.eticket_number} onChange={e => handleChange('eticket_number', e.target.value)} className={inputClass} /></Field>
          </div>
        </Section>

        {/* Primary Passenger */}
        <Section title="Primary Passenger" icon={<User className="h-5 w-5 text-primary" />} required>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name *" error={errors.passenger_first_name}><Input value={formData.passenger_first_name} onChange={e => handleChange('passenger_first_name', e.target.value)} className={`${inputClass} ${errors.passenger_first_name ? 'border-red-500' : ''}`} /></Field>
            <Field label="Last Name *" error={errors.passenger_last_name}><Input value={formData.passenger_last_name} onChange={e => handleChange('passenger_last_name', e.target.value)} className={`${inputClass} ${errors.passenger_last_name ? 'border-red-500' : ''}`} /></Field>
            <Field label="Gender">
              <Select value={formData.gender} onValueChange={v => handleChange('gender', v)}><SelectTrigger className={inputClass}><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
            </Field>
            <Field label="Date of Birth"><Input type="date" value={formData.date_of_birth} onChange={e => handleChange('date_of_birth', e.target.value)} className={inputClass} /></Field>
            <Field label="Nationality"><Input value={formData.nationality} onChange={e => handleChange('nationality', e.target.value)} className={inputClass} /></Field>
            <Field label="Passport Number"><Input value={formData.passport_number} onChange={e => handleChange('passport_number', e.target.value)} className={inputClass} /></Field>
            <Field label="Passport Expiry"><Input type="date" value={formData.passport_expiry} onChange={e => handleChange('passport_expiry', e.target.value)} className={inputClass} /></Field>
            {/* <Field label="CNIC/ID Number"><Input value={formData.cnic} onChange={e => handleChange('cnic', e.target.value)} className={inputClass} /></Field> */}
          </div>
        </Section>

        {/* Additional Passengers */}
        {formData.additional_passengers?.length > 0 && (
          <Section title={`Additional Passengers (${formData.additional_passengers.length})`} icon={<Users className="h-5 w-5 text-primary" />}>
            {formData.additional_passengers.map((pax: any, index: number) => (
              <div key={index} className={`${index > 0 ? 'mt-4 pt-4 border-t border-slate-200' : ''}`}>
                <p className="text-sm font-semibold text-slate-700 mb-3">Passenger {index + 2} - <span className="capitalize">{pax.passenger_type || 'Adult'}</span></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="First Name"><Input value={pax.first_name} onChange={e => handleAdditionalPassengerChange(index, 'first_name', e.target.value)} className={inputClass} /></Field>
                  <Field label="Last Name"><Input value={pax.last_name} onChange={e => handleAdditionalPassengerChange(index, 'last_name', e.target.value)} className={inputClass} /></Field>
                  <Field label="Gender"><Select value={pax.gender} onValueChange={v => handleAdditionalPassengerChange(index, 'gender', v)}><SelectTrigger className={inputClass}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></Field>
                  <Field label="Date of Birth"><Input type="date" value={pax.date_of_birth || ''} onChange={e => handleAdditionalPassengerChange(index, 'date_of_birth', e.target.value)} className={inputClass} /></Field>
                  <Field label="Nationality"><Input value={pax.nationality || ''} onChange={e => handleAdditionalPassengerChange(index, 'nationality', e.target.value)} className={inputClass} /></Field>
                  <Field label="Passport Number"><Input value={pax.passport_number || ''} onChange={e => handleAdditionalPassengerChange(index, 'passport_number', e.target.value)} className={inputClass} /></Field>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Contact Information */}
        <Section title="Contact Information" icon={<Phone className="h-5 w-5 text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Email *" error={errors.email}><Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`} /></Field>
            <Field label="Phone *" error={errors.phone}><Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`} /></Field>
            <Field label="Emergency Contact"><Input value={formData.emergency_contact} onChange={e => handleChange('emergency_contact', e.target.value)} className={inputClass} /></Field>
          </div>
        </Section>

        {/* Address - NEWLY ADDED */}
        <Section title="Address" icon={<MapPin className="h-5 w-5 text-primary" />}>
          <div className="space-y-4">
            <Field label="Street Address">
              <Textarea 
                value={formData.address} 
                onChange={e => handleChange('address', e.target.value)} 
                className={inputClass} 
                rows={2}
                placeholder="Enter street address"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="City">
                <Input value={formData.city} onChange={e => handleChange('city', e.target.value)} className={inputClass} placeholder="City" />
              </Field>
              <Field label="Country">
                <Input value={formData.country} onChange={e => handleChange('country', e.target.value)} className={inputClass} placeholder="Country" />
              </Field>
              <Field label="Post Code">
                <Input value={formData.zip_code} onChange={e => handleChange('zip_code', e.target.value)} className={inputClass} placeholder="Post code" />
              </Field>
            </div>
          </div>
        </Section>

        {/* Baggage */}
        {/* Baggage */}
<Section title="Baggage Allowance" icon={<Luggage className="h-5 w-5 text-primary" />}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Checked Baggage */}
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-700">Checked Baggage (per passenger)</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Pieces</Label>
          <Select 
            value={formData.checked_baggage_count?.toString() || '0'} 
            onValueChange={v => handleChange('checked_baggage_count', parseInt(v))}
          >
            <SelectTrigger className={inputClass}><SelectValue placeholder="Pieces" /></SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4, 5].map(n => (
                <SelectItem key={n} value={n.toString()}>{n}x</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Weight</Label>
          <Select 
            value={formData.checked_baggage_kg?.toString() || '23'} 
            onValueChange={v => handleChange('checked_baggage_kg', parseInt(v))}
          >
            <SelectTrigger className={inputClass}><SelectValue placeholder="Weight" /></SelectTrigger>
            <SelectContent>
              {[15, 20, 23, 25, 30, 35, 40].map(n => (
                <SelectItem key={n} value={n.toString()}>{n}kg</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">
        Total: {formData.checked_baggage_count || 0} × {formData.checked_baggage_kg || 23}kg = {(formData.checked_baggage_count || 0) * (formData.checked_baggage_kg || 23)}kg
      </p>
    </div>

    {/* Hand Luggage */}
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-700">Hand Luggage (per passenger)</Label>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Pieces</Label>
          <Select 
            value={formData.hand_luggage_count?.toString() || '0'} 
            onValueChange={v => handleChange('hand_luggage_count', parseInt(v))}
          >
            <SelectTrigger className={inputClass}><SelectValue placeholder="Pieces" /></SelectTrigger>
            <SelectContent>
              {[0, 1, 2].map(n => (
                <SelectItem key={n} value={n.toString()}>{n}x</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Weight</Label>
          <Select 
            value={formData.hand_luggage_kg?.toString() || '7'} 
            onValueChange={v => handleChange('hand_luggage_kg', parseInt(v))}
          >
            <SelectTrigger className={inputClass}><SelectValue placeholder="Weight" /></SelectTrigger>
            <SelectContent>
              {[5, 7, 8, 10].map(n => (
                <SelectItem key={n} value={n.toString()}>{n}kg</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 font-medium">
        Total: {formData.hand_luggage_count || 0} × {formData.hand_luggage_kg || 7}kg = {(formData.hand_luggage_count || 0) * (formData.hand_luggage_kg || 7)}kg
      </p>
    </div>
  </div>
</Section>

        {/* Accessibility */}
        <Section title="Accessibility & Special Assistance" icon={<Accessibility className="h-5 w-5 text-primary" />}>
          <div className="space-y-4">
            <Field label="Wheelchair / Mobility">
              <Select value={formData.wheelchair_required} onValueChange={v => handleChange('wheelchair_required', v)}>
                <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Not Applicable</SelectItem>
                  <SelectItem value="wheelchair">Wheelchair Required</SelectItem>
                  <SelectItem value="special_assistance">Special Assistance Required</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div><Label className="text-sm font-medium text-slate-700">Priority Pass (Disability)</Label><p className="text-xs text-slate-500 mt-0.5">Priority boarding for passengers with disabilities</p></div>
              <Switch checked={formData.priority_pass} onCheckedChange={v => handleChange('priority_pass', v)} />
            </div>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Flight Preferences" icon={<Utensils className="h-5 w-5 text-primary" />}>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Field label="Seat Number">
      <Input value={formData.seat_number} onChange={e => handleChange('seat_number', e.target.value)} className={inputClass} />
    </Field>
    <Field label="Seat Preference">
      <Select value={formData.seat_preference || ''} onValueChange={v => handleChange('seat_preference', v)}>
        <SelectTrigger className={inputClass}><SelectValue placeholder="Select seat preference" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="window">🪟 Window Seat</SelectItem>
          <SelectItem value="aisle">🚶 Aisle Seat</SelectItem>
          <SelectItem value="middle">💺 Middle Seat</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <Field label="Extra Legroom">
      <Select value={formData.extra_legroom ? 'yes' : 'no'} onValueChange={v => handleChange('extra_legroom', v === 'yes')}>
        <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="no">No</SelectItem>
          <SelectItem value="yes">Yes</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <Field label="Economy Delight">
  <Select value={formData.economy_delight ? 'yes' : 'no'} onValueChange={v => handleChange('economy_delight', v === 'yes')}>
    <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="no">No</SelectItem>
      <SelectItem value="yes">Yes</SelectItem>
    </SelectContent>
  </Select>
  <p className="text-[10px] text-slate-400 mt-1">Extra legroom, priority boarding & enhanced meal</p>
</Field>
    <Field label="Meal Preference">
      <Select value={formData.meal_preference} onValueChange={v => handleChange('meal_preference', v)}>
        <SelectTrigger className={inputClass}><SelectValue placeholder="Select meal" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="regular">Regular</SelectItem>
          <SelectItem value="vegetarian">Vegetarian</SelectItem>
          <SelectItem value="vegan">Vegan</SelectItem>
          <SelectItem value="halal">Halal</SelectItem>
          <SelectItem value="kosher">Kosher</SelectItem>
          <SelectItem value="gluten_free">Gluten Free</SelectItem>
        </SelectContent>
      </Select>
    </Field>
    <div className="md:col-span-2">
      <Field label="Special Assistance Details">
        <Textarea value={formData.special_assistance} onChange={e => handleChange('special_assistance', e.target.value)} className={inputClass} rows={2} />
      </Field>
    </div>
  </div>
</Section>

        {/* Remarks */}
        <Section title="Remarks" icon={<FileText className="h-5 w-5 text-primary" />}>
          <Textarea value={formData.remarks} onChange={e => handleChange('remarks', e.target.value)} className={inputClass} rows={3} />
        </Section>

        {/* Actions */}
        <div className="flex items-center gap-4 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate({ to: '/dashboard/bookings/$bookingId/view', params: { bookingId } })} disabled={saving}><ArrowLeft className="h-4 w-4 mr-2" /> Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}</Button>
        </div>
      </form>
    </>
  );
}

// Helper Components
function Section({ title, icon, children, required }: { title: string; icon: React.ReactNode; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        {icon}{title}{required && <span className="text-red-500 text-sm">*</span>}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-slate-700 mb-1.5">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}