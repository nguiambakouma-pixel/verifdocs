export type UserRole = 'super_admin' | 'institution_admin';

export type InstitutionStatus = 'pending' | 'approved' | 'suspended';

export interface Institution {
  id: string;
  name: string;
  short_name: string;
  city: string;
  status: InstitutionStatus;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  institution_id: string | null;
}

export type ProfileWithInstitution = Profile & {
  institution: Institution | null;
};

export type DocumentStatus = 'valid' | 'revoked';

export type DocumentType =
  | 'diplome'
  | 'attestation'
  | 'releve_notes'
  | 'certificat';

export interface DocumentRecord {
  id: string;
  verification_code: string;
  institution_id: string;
  holder_name: string;
  document_type: DocumentType;
  title: string;
  document_number: string | null;
  file_hash: string | null;
  sealed_at: string | null;
  graduation_year: number;
  issue_date: string | null;
  status: DocumentStatus;
  revoked_at: string | null;
  revoked_reason: string | null;
  is_demo: boolean;
  created_by: string;
  created_at: string;
}

export interface VerificationResult {
  result: 'authentic' | 'revoked' | 'not_found';
  holder_name?: string;
  document_type?: DocumentType;
  title?: string;
  document_number?: string;
  graduation_year?: number;
  issue_date?: string | null;
  institution_name?: string;
  institution_short_name?: string;
  has_file?: boolean;
  is_demo?: boolean;
  verified_by?: 'qr' | 'file';
}
