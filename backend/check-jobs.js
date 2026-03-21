const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const count = await prisma.jobPosting.count();
    console.log('Job Count:', count);
}
main().finally(() => prisma.$disconnect());
