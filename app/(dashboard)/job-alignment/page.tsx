import React from 'react';
import JobAlignmentClient from './page.client';

export const metadata = {
  title: 'Job Alignment Matrix | KodNest Intelligence',
  description: 'AI-driven resume-to-job matching across global registries.',
};

export default function JobAlignmentPage() {
  return <JobAlignmentClient />;
}
