import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed (SQLite Mode)...');

    // Clear existing data
    await prisma.auditLog.deleteMany();
    await prisma.eventLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.readinessScore.deleteMany();
    await prisma.roundMap.deleteMany();
    await prisma.prepTask.deleteMany();
    await prisma.prepPlan.deleteMany();
    await prisma.aTSAssessment.deleteMany();
    await prisma.resumeSection.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.jobTracking.deleteMany();
    await prisma.jobEmbedding.deleteMany();
    await prisma.userSkill.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.jobPosting.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Cleared existing data');

    // Create Skills
    const skills = await Promise.all([
        prisma.skill.create({ data: { name: 'JavaScript', normalizedName: 'javascript', category: 'Frontend' } }),
        prisma.skill.create({ data: { name: 'TypeScript', normalizedName: 'typescript', category: 'Frontend' } }),
        prisma.skill.create({ data: { name: 'React', normalizedName: 'react', category: 'Frontend' } }),
        prisma.skill.create({ data: { name: 'Vue.js', normalizedName: 'vue.js', category: 'Frontend' } }),
        prisma.skill.create({ data: { name: 'Angular', normalizedName: 'angular', category: 'Frontend' } }),
        prisma.skill.create({ data: { name: 'Node.js', normalizedName: 'node.js', category: 'Backend' } }),
        prisma.skill.create({ data: { name: 'NestJS', normalizedName: 'nestjs', category: 'Backend' } }),
        prisma.skill.create({ data: { name: 'Python', normalizedName: 'python', category: 'Backend' } }),
        prisma.skill.create({ data: { name: 'Django', normalizedName: 'django', category: 'Backend' } }),
        prisma.skill.create({ data: { name: 'Go', normalizedName: 'go', category: 'Backend' } }),
        prisma.skill.create({ data: { name: 'PostgreSQL', normalizedName: 'postgresql', category: 'Database' } }),
        prisma.skill.create({ data: { name: 'MongoDB', normalizedName: 'mongodb', category: 'Database' } }),
        prisma.skill.create({ data: { name: 'Redis', normalizedName: 'redis', category: 'Database' } }),
        prisma.skill.create({ data: { name: 'Docker', normalizedName: 'docker', category: 'DevOps' } }),
        prisma.skill.create({ data: { name: 'Kubernetes', normalizedName: 'kubernetes', category: 'DevOps' } }),
        prisma.skill.create({ data: { name: 'AWS', normalizedName: 'aws', category: 'Cloud' } }),
        prisma.skill.create({ data: { name: 'Azure', normalizedName: 'azure', category: 'Cloud' } }),
        prisma.skill.create({ data: { name: 'Figma', normalizedName: 'figma', category: 'Design' } }),
    ]);

    console.log('✅ Created skills');

    // Create Users with Profiles
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            email: 'john.doe@example.com',
            passwordHash: hashedPassword,
            role: 'USER',
            emailVerified: true,
            profile: {
                create: {
                    firstName: 'John',
                    lastName: 'Doe',
                    headline: 'Senior Full Stack Engineer',
                    bio: 'Full-stack developer with 5 years of experience',
                    location: 'San Francisco, CA',
                    socialLinks: JSON.stringify({
                        github: 'https://github.com/johndoe',
                        linkedin: 'https://linkedin.com/in/johndoe'
                    }),
                },
            },
        },
        include: { profile: true },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'jane.smith@example.com',
            passwordHash: hashedPassword,
            role: 'USER',
            emailVerified: true,
            profile: {
                create: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    headline: 'Frontend Specialist',
                    bio: 'Frontend specialist passionate about UX',
                    location: 'New York, NY',
                    socialLinks: JSON.stringify({
                        github: 'https://github.com/janesmith',
                        linkedin: 'https://linkedin.com/in/janesmith'
                    }),
                },
            },
        },
        include: { profile: true },
    });

    console.log('✅ Created users');

    // Add skills to users
    if (user1.profile && user2.profile) {
        await prisma.userSkill.createMany({
            data: [
                { profileId: user1.profile.id, skillId: skills[0].id, level: 4, verified: true },
                { profileId: user1.profile.id, skillId: skills[1].id, level: 5, verified: true },
                { profileId: user1.profile.id, skillId: skills[5].id, level: 4, verified: false },
                { profileId: user2.profile.id, skillId: skills[2].id, level: 5, verified: true },
            ],
        });
    }

    // Create Job Postings
    const jobData = [
        {
            externalId: 'job-1',
            title: 'Senior Full-Stack Developer',
            company: 'TechCorp Inc.',
            location: 'Remote',
            salary: '120k - 180k USD',
            description: 'We are looking for a Senior Full-Stack Developer...',
            requirements: JSON.stringify(['React', 'Node.js', 'PostgreSQL']),
            status: 'OPEN',
            source: 'ADZUNA',
            applyUrl: 'https://example.com/apply/1',
        },
        {
            externalId: 'job-2',
            title: 'Frontend Engineer',
            company: 'StartupXYZ',
            location: 'San Francisco, CA',
            salary: '100k - 150k USD',
            description: 'Join our fast-growing startup...',
            requirements: JSON.stringify(['React', 'TypeScript', 'Figma']),
            status: 'OPEN',
            source: 'ADZUNA',
            applyUrl: 'https://example.com/apply/2',
        },
        {
            externalId: 'job-3',
            title: 'Backend Developer',
            company: 'DataFlow',
            location: 'New York, NY',
            salary: '130k - 190k USD',
            description: 'High-performance backend systems...',
            requirements: JSON.stringify(['Go', 'Redis', 'Docker', 'Kubernetes']),
            status: 'OPEN',
            source: 'THEMUSE',
            applyUrl: 'https://example.com/apply/3',
        },
        {
            externalId: 'job-4',
            title: 'Python Developer',
            company: 'AILabs',
            location: 'Remote',
            salary: '110k - 160k USD',
            description: 'Build AI-powered applications...',
            requirements: JSON.stringify(['Python', 'Django', 'AWS']),
            status: 'OPEN',
            source: 'THEMUSE',
            applyUrl: 'https://example.com/apply/4',
        },
        {
            externalId: 'job-5',
            title: 'UI/UX Designer',
            company: 'Creative Studio',
            location: 'London, UK',
            salary: '80k - 120k GBP',
            description: 'Design the next generation of products...',
            requirements: JSON.stringify(['Figma', 'React', 'CSS']),
            status: 'OPEN',
            source: 'ADZUNA',
            applyUrl: 'https://example.com/apply/5',
        },
        {
            externalId: 'job-6',
            title: 'DevOps Engineer',
            company: 'CloudScale',
            location: 'Berlin, DE',
            salary: '90k - 140k EUR',
            description: 'Scaling global infrastructure...',
            requirements: JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'Terraform']),
            status: 'OPEN',
            source: 'THEMUSE',
            applyUrl: 'https://example.com/apply/6',
        }
    ];

    const createdJobs = await Promise.all(jobData.map(data => prisma.jobPosting.create({ data })));

    console.log('✅ Created job postings');

    // Create Resumes
    const resume1 = await prisma.resume.create({
        data: {
            userId: user1.id,
            title: 'John Doe - Resume',
            textContent: 'Experienced Full Stack Developer...',
            status: 'PUBLISHED',
            sections: {
                create: [
                    {
                        type: 'Experience',
                        content: JSON.stringify({ role: 'Senior Dev', company: 'TechCorp', duration: '2020-Present' }),
                    },
                ],
            },
            assessment: {
                create: {
                    overallScore: 85,
                    keywordsMatched: JSON.stringify(['React', 'Node.js']),
                    missingKeywords: JSON.stringify(['Python']),
                    summary: 'Good match for full stack roles.'
                }
            }
        },
    });

    // Analytics & Matches
    await prisma.readinessScore.create({
        data: {
            userId: user1.id,
            currentScore: 85.5,
            history: JSON.stringify([{ date: '2024-01-01', score: 80 }]),
        },
    });

    await prisma.jobTracking.create({
        data: {
            userId: user1.id,
            jobId: createdJobs[0].id,
            score: 95.0,
            status: 'APPLIED',
            matchDetails: JSON.stringify({ strengths: ['React', 'Node.js'], gaps: [] }),
        },
    });

    await prisma.notification.create({
        data: {
            userId: user1.id,
            type: 'INFO',
            title: 'Welcome!',
            message: 'Welcome to KodNestCareers.',
            isRead: false,
        },
    });

    console.log('🎉 Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
