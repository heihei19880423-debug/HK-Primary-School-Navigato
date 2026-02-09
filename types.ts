
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

export interface School {
  id: string;
  name: string;
  nameZh: string;
  location: string;
  district: string; // New field for HK District
  tuitionFee: string;
  curriculum: Curriculum[];
  language: string[];
  type: SchoolType;
  ranking: number; // Overall ranking
  categoryRanking?: number; // Ranking within its specific curriculum
  applicationStart: string; // ISO Date
  applicationEnd: string;   // ISO Date
  interviewDate: string;   // Estimated window
  description: string;
  website: string; // Official school website
  interviewRequirements: string; // Capabilities required
  interviewTips: string; // Experience and precautions
}

export interface UserReminder {
  schoolId: string;
  status: 'interested' | 'applied' | 'interview_scheduled';
}
