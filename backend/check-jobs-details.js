const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const jobs = await prisma.jobPosting.findMany({
        select: { title: true, createdAt: true, status: true, requirements: true },
        take: 5
    });
    console.log('Recent Jobs:', JSON.stringify(jobs, null, 2));
}
main().finally(() => prisma.$disconnect());
