import {
  Program,
  Pilgrim,
  Booking,
  Partner,
  FamilyGroup,
  RoomAllocation,
  ChequeRecord,
  OperationAlert
} from '../types';

export const AGENCY_DETAILS = {
  name: 'وكالة زاد للسفر والسياحة - ZAD TRAVEL & TOURISM',
  frenchName: 'ZAD TRAVEL & TOURISM',
  address: '383 تجزئة الأمان، المحاميدية، مراكش (قبالة مسجد الأميرة لالة أمت الله)',
  phone: '+212 524 20 97 13 / +212 664 61 00 61',
  email: 'zadtravelandtourism@gmail.com',
  website: 'www.zadtravelandtourism.com',
  bankName: 'التجاري وفا بنك (Attijariwafa Bank)',
  rib: '007 780 00001234567890 12 34',
  licenseNo: '45 / 2024',
};

export const INITIAL_PROGRAMS: Program[] = [];

export const INITIAL_PILGRIMS: Pilgrim[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_PARTNERS: Partner[] = [];

export const INITIAL_FAMILIES_GROUPS: FamilyGroup[] = [];

export const INITIAL_ROOM_ALLOCATIONS: RoomAllocation[] = [];

export const INITIAL_CHEQUES: ChequeRecord[] = [];

export const INITIAL_OPERATIONAL_ALERTS: OperationAlert[] = [];
