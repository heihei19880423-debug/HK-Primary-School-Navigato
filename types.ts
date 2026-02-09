
export enum Curriculum {
  DSE = 'DSE',
  IB = 'IB',
  AP = 'AP',
  British = 'British (A-Level)'
}

export enum SchoolType {
  International = 'International',
  DSS = 'DSS (Direct Subsidy)',
  Private = 'Private',
  Aided = 'Aided/Government'
}

export type ApplicationStatus = 'planning' | 'applied' | 'interviewing' | 'accepted' | 'waitlisted' | 'rejected';

export interface School {
  id: string;
  name: string;
  nameZh: string;
  location: string;
  district: string;
  tuitionFee: string;
  curriculum: Curriculum[];
  language: string[];
  type: SchoolType;
  ranking: number;
  categoryRanking?: number;
  applicationStart: string;
  applicationEnd: string;
  interviewDate: string;
  description: string;
  website: string;
  interviewRequirements: string;
  interviewTips: string;
}

export interface UserProgress {
  schoolId: string;
  status: ApplicationStatus;
  updatedAt: string;
}
