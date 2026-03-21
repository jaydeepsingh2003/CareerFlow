const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const jobs = await prisma.jobPosting.findMany({ select: { id: true, title: true }, take: 5 });
    console.log(JSON.stringify(jobs, null, 2));
}
main().finally(() => prisma.$disconnect());
