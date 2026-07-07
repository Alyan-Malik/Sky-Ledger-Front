// src/components/booking/PassengerForm.tsx

import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, CreditCard, FileText, Utensils, 
  Luggage, Accessibility, Baby, UserCheck, Users 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { CreateBookingFormData, AdditionalPassenger } from '../../types/booking';
import { Loader2 } from 'lucide-react';

interface PassengerFormProps {
  onSubmit: (data: CreateBookingFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  totalPassengers: {
    adults: number;
    children: number;
    infants: number;
  };
}

export const PassengerForm: React.FC<PassengerFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  onCancel,
  totalPassengers 
}) => {
  const totalPax = totalPassengers.adults + totalPassengers.children + totalPassengers.infants;
  const additionalCount = totalPax - 1; // Minus primary adult passenger

  console.log('PassengerForm - totalPassengers:', totalPassengers);
  console.log('PassengerForm - totalPax:', totalPax);
  console.log('PassengerForm - additionalCount:', additionalCount);

  // Create initial additional passengers array
  const createAdditionalPassengers = (): AdditionalPassenger[] => {
    if (additionalCount <= 0) return [];
    
    const passengers: AdditionalPassenger[] = [];
    let adultIdx = 1; // Start from 1 because primary is adult 0
    let childIdx = 0;
    let infantIdx = 0;

    for (let i = 0; i < additionalCount; i++) {
      if (adultIdx < totalPassengers.adults) {
        passengers.push({
          first_name: '',
          last_name: '',
          gender: '',
          date_of_birth: '',
          nationality: '',
          passport_number: '',
          passport_expiry: '',
          passenger_type: 'adult',
        });
        adultIdx++;
      } else if (childIdx < totalPassengers.children) {
        passengers.push({
          first_name: '',
          last_name: '',
          gender: '',
          date_of_birth: '',
          nationality: '',
          passport_number: '',
          passport_expiry: '',
          passenger_type: 'child',
        });
        childIdx++;
      } else if (infantIdx < totalPassengers.infants) {
        passengers.push({
          first_name: '',
          last_name: '',
          gender: '',
          date_of_birth: '',
          nationality: '',
          passport_number: '',
          passport_expiry: '',
          passenger_type: 'infant',
        });
        infantIdx++;
      }
    }

    return passengers;
  };

  const [formData, setFormData] = useState<CreateBookingFormData>({
    passenger_first_name: '',
    passenger_last_name: '',
    gender: '',
    date_of_birth: '',
    nationality: '',
    passport_number: '',
    passport_expiry: '',
    cnic: '',
    email: '',
    phone: '',
    emergency_contact: '',
    address: '',
    city: '',
    country: '',
    zip_code: '',
    additional_passengers: createAdditionalPassengers(),
    checked_baggage_count: 0,
    hand_luggage_count: 0,
    wheelchair_required: 'none',
    priority_pass: false,
    seat_number: '',
    meal_preference: '',
    special_assistance: '',
    remarks: '',
    booking_id: '',
    pnr_number: '',
    eticket_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateBookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAdditionalPassengerChange = (
    index: number, 
    field: keyof AdditionalPassenger, 
    value: string
  ) => {
    setFormData(prev => {
      const updated = [...(prev.additional_passengers || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, additional_passengers: updated };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.passenger_first_name.trim()) {
      newErrors.passenger_first_name = 'Primary passenger first name is required';
    }
    if (!formData.passenger_last_name.trim()) {
      newErrors.passenger_last_name = 'Primary passenger last name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    // Validate additional passengers
    if (formData.additional_passengers) {
      formData.additional_passengers.forEach((p, i) => {
        if (!p.first_name.trim()) {
          newErrors[`additional_${i}_first_name`] = 'First name is required';
        }
        if (!p.last_name.trim()) {
          newErrors[`additional_${i}_last_name`] = 'Last name is required';
        }
        if (!p.gender) {
          newErrors[`additional_${i}_gender`] = 'Gender is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Filter out empty additional passengers
    const cleanedData = {
      ...formData,
      additional_passengers: formData.additional_passengers?.filter(
        p => p.first_name.trim() || p.last_name.trim()
      ) || [],
    };
    
    await onSubmit(cleanedData);
  };

  const inputClass = "h-11 border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary rounded-lg";
  const labelClass = "text-sm font-medium text-slate-700 mb-1.5";

  // Build passenger type labels
  const getPassengerLabel = (index: number): string => {
    let adultIdx = 1;
    let childIdx = 0;
    let infantIdx = 0;

    for (let i = 0; i <= index; i++) {
      if (i === index) {
        if (adultIdx < totalPassengers.adults) return 'Adult';
        if (childIdx < totalPassengers.children) return 'Child';
        if (infantIdx < totalPassengers.infants) return 'Infant';
      }
      if (adultIdx < totalPassengers.adults) adultIdx++;
      else if (childIdx < totalPassengers.children) childIdx++;
      else if (infantIdx < totalPassengers.infants) infantIdx++;
    }
    return 'Passenger';
  };

  const getPassengerIcon = (index: number) => {
    const type = getPassengerLabel(index);
    if (type === 'Infant') return <Baby className="h-4 w-4" />;
    if (type === 'Child') return <User className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking References */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Booking References
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Booking ID (Auto-generated)</Label>
            <Input
              placeholder="Auto-generated"
              value={formData.booking_id}
              onChange={(e) => handleChange('booking_id', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>PNR Number (Optional)</Label>
            <Input
              placeholder="Enter PNR"
              value={formData.pnr_number || ''}
              onChange={(e) => handleChange('pnr_number', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>E-ticket Number (Optional)</Label>
            <Input
              placeholder="Auto-generated"
              value={formData.eticket_number || ''}
              onChange={(e) => handleChange('eticket_number', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Primary Passenger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-primary" />
          Primary Passenger (Adult 1) <span className="text-red-500 text-sm">*Required</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>First Name *</Label>
            <Input
              placeholder="John"
              value={formData.passenger_first_name}
              onChange={(e) => handleChange('passenger_first_name', e.target.value)}
              className={`${inputClass} ${errors.passenger_first_name ? 'border-red-500' : ''}`}
            />
            {errors.passenger_first_name && <p className="text-xs text-red-500">{errors.passenger_first_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Last Name *</Label>
            <Input
              placeholder="Doe"
              value={formData.passenger_last_name}
              onChange={(e) => handleChange('passenger_last_name', e.target.value)}
              className={`${inputClass} ${errors.passenger_last_name ? 'border-red-500' : ''}`}
            />
            {errors.passenger_last_name && <p className="text-xs text-red-500">{errors.passenger_last_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Gender *</Label>
            <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
              <SelectTrigger className={`${inputClass} ${errors.gender ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Date of Birth</Label>
            <Input
              type="date"
              value={formData.date_of_birth || ''}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Nationality</Label>
            <Input
              placeholder="e.g., American"
              value={formData.nationality || ''}
              onChange={(e) => handleChange('nationality', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Passport Number</Label>
            <Input
              placeholder="Enter passport number"
              value={formData.passport_number || ''}
              onChange={(e) => handleChange('passport_number', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Passport Expiry</Label>
            <Input
              type="date"
              value={formData.passport_expiry || ''}
              onChange={(e) => handleChange('passport_expiry', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>CNIC/ID Number</Label>
            <Input
              placeholder="Enter ID number"
              value={formData.cnic || ''}
              onChange={(e) => handleChange('cnic', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Additional Passengers */}
      {additionalCount > 0 && formData.additional_passengers && formData.additional_passengers.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Additional Passengers ({additionalCount})
          </h3>
          
          {formData.additional_passengers.map((passenger, index) => (
            <div key={index} className={`${index > 0 ? 'mt-6 pt-6 border-t border-slate-200' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`p-1.5 rounded-full ${
                  getPassengerLabel(index) === 'Infant' ? 'bg-pink-100 text-pink-600' :
                  getPassengerLabel(index) === 'Child' ? 'bg-blue-100 text-blue-600' :
                  'bg-primary/10 text-primary'
                }`}>
                  {getPassengerIcon(index)}
                </div>
                <span className="font-medium text-slate-700">
                  Passenger {index + 2} - {getPassengerLabel(index)}
                </span>
                {getPassengerLabel(index) !== 'Adult' && (
                  <span className="text-xs text-slate-400">(Optional fields)</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className={labelClass}>
                    First Name {getPassengerLabel(index) === 'Adult' ? '*' : ''}
                  </Label>
                  <Input
                    placeholder="First name"
                    value={passenger.first_name}
                    onChange={(e) => handleAdditionalPassengerChange(index, 'first_name', e.target.value)}
                    className={`${inputClass} ${errors[`additional_${index}_first_name`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`additional_${index}_first_name`] && (
                    <p className="text-xs text-red-500">{errors[`additional_${index}_first_name`]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>
                    Last Name {getPassengerLabel(index) === 'Adult' ? '*' : ''}
                  </Label>
                  <Input
                    placeholder="Last name"
                    value={passenger.last_name}
                    onChange={(e) => handleAdditionalPassengerChange(index, 'last_name', e.target.value)}
                    className={`${inputClass} ${errors[`additional_${index}_last_name`] ? 'border-red-500' : ''}`}
                  />
                  {errors[`additional_${index}_last_name`] && (
                    <p className="text-xs text-red-500">{errors[`additional_${index}_last_name`]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>
                    Gender {getPassengerLabel(index) === 'Adult' ? '*' : ''}
                  </Label>
                  <Select 
                    value={passenger.gender} 
                    onValueChange={(v) => handleAdditionalPassengerChange(index, 'gender', v)}
                  >
                    <SelectTrigger className={`${inputClass} ${errors[`additional_${index}_gender`] ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[`additional_${index}_gender`] && (
                    <p className="text-xs text-red-500">{errors[`additional_${index}_gender`]}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Date of Birth</Label>
                  <Input
                    type="date"
                    value={passenger.date_of_birth || ''}
                    onChange={(e) => handleAdditionalPassengerChange(index, 'date_of_birth', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Nationality</Label>
                  <Input
                    placeholder="Nationality"
                    value={passenger.nationality || ''}
                    onChange={(e) => handleAdditionalPassengerChange(index, 'nationality', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelClass}>Passport Number</Label>
                  <Input
                    placeholder="Passport number"
                    value={passenger.passport_number || ''}
                    onChange={(e) => handleAdditionalPassengerChange(index, 'passport_number', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Email *</Label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Phone *</Label>
            <Input
              type="tel"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`${inputClass} ${errors.phone ? 'border-red-500' : ''}`}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Emergency Contact</Label>
            <Input
              type="tel"
              placeholder="Emergency phone"
              value={formData.emergency_contact || ''}
              onChange={(e) => handleChange('emergency_contact', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Address
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Street Address</Label>
            <Textarea
              placeholder="Enter your address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className={inputClass}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>City</Label>
              <Input
                placeholder="City"
                value={formData.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Country</Label>
              <Input
                placeholder="Country"
                value={formData.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Zip Code</Label>
              <Input
                placeholder="Zip code"
                value={formData.zip_code || ''}
                onChange={(e) => handleChange('zip_code', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Baggage */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Luggage className="h-5 w-5 text-primary" />
          Baggage Allowance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Checked Baggage (per passenger)</Label>
            <Select 
              value={formData.checked_baggage_count.toString()} 
              onValueChange={(v) => handleChange('checked_baggage_count', parseInt(v))}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? 'bag' : 'bags'} (23kg each)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Hand Luggage (per passenger)</Label>
            <Select 
              value={formData.hand_luggage_count.toString()} 
              onValueChange={(v) => handleChange('hand_luggage_count', parseInt(v))}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2].map(n => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? 'piece' : 'pieces'} (7kg each)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-primary" />
          Accessibility & Special Assistance
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Wheelchair / Mobility Assistance</Label>
            <Select 
              value={formData.wheelchair_required} 
              onValueChange={(v) => handleChange('wheelchair_required', v as any)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Not Applicable</SelectItem>
                <SelectItem value="wheelchair">Wheelchair Required</SelectItem>
                <SelectItem value="special_assistance">Special Assistance Required</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-slate-700">Priority Pass (Disability)</Label>
              <p className="text-xs text-slate-500 mt-0.5">
                Priority boarding and assistance for passengers with disabilities
              </p>
            </div>
            <Switch
              checked={formData.priority_pass}
              onCheckedChange={(checked) => handleChange('priority_pass', checked)}
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          Flight Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelClass}>Seat Number</Label>
            <Input
              placeholder="e.g., 12A"
              value={formData.seat_number || ''}
              onChange={(e) => handleChange('seat_number', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Meal Preference</Label>
            <Select 
              value={formData.meal_preference || ''} 
              onValueChange={(v) => handleChange('meal_preference', v)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select meal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="halal">Halal</SelectItem>
                <SelectItem value="kosher">Kosher</SelectItem>
                <SelectItem value="gluten_free">Gluten Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <Label className={labelClass}>Special Assistance Details</Label>
            <Textarea
              placeholder="Describe any special assistance needed..."
              value={formData.special_assistance || ''}
              onChange={(e) => handleChange('special_assistance', e.target.value)}
              className={inputClass}
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Additional Remarks
        </h3>
        <Textarea
          placeholder="Any additional notes or remarks..."
          value={formData.remarks || ''}
          onChange={(e) => handleChange('remarks', e.target.value)}
          className={inputClass}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-12 px-8"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Booking...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
    </form>
  );
};