export interface FetchParams {
  page: number;
  role?: string;
  location?: string;
}

export interface NormalizedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  source: "ADZUNA" | "THEMUSE" | "RAPIDAPI";
  applyUrl: string;
  postedAt: Date;
}

export interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  applyUrl: string;
  postedAt: Date;
  source: string;
}

export interface JobSourceAdapter {
  fetchJobs(params: FetchParams): Promise<NormalizedJob[]>;
}
